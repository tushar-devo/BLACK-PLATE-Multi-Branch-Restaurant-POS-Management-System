import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Grid,
  Box,
  CheckCircle,
  Clock,
  AlertCircle,
  Plus,
  QrCode,
  Utensils,
} from 'lucide-react';
import { useRestaurant } from '../../context/RestaurantContext';
import { Table, TableStatus } from '../../types';

interface Restaurant3DFloorProps {
  onTableAction?: (table: Table) => void;
  onOpenAddTable?: () => void;
  onOpenTableQR?: (table: Table) => void;
}

export const Restaurant3DFloor: React.FC<Restaurant3DFloorProps> = ({
  onTableAction,
  onOpenAddTable,
  onOpenTableQR,
}) => {
  const { tables, currentBranch, updateTableStatus, setSelectedTableId } = useRestaurant();
  const branchTables = tables.filter((t) => t.branchId === currentBranch.id);

  const containerRef = useRef<HTMLDivElement>(null);
  const [viewMode, setViewMode] = useState<'3D' | '2D'>('3D');
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [hoveredTable, setHoveredTable] = useState<Table | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  // Three.js instances ref
  const threeRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    tableMeshes: Map<string, THREE.Group>;
    targetCameraPos: THREE.Vector3;
    targetLookAt: THREE.Vector3;
    currentLookAt: THREE.Vector3;
    animationId?: number;
  } | null>(null);

  // Color mapping based on specification
  const getStatusColor = (status: TableStatus): number => {
    switch (status) {
      case 'Available':
        return 0x06990f; // #06990F
      case 'Booked':
        return 0xff0000; // #FF0000
      case 'Pending':
        return 0xffff00; // #FFFF00
      case 'Occupied':
        return 0x3b82f6; // Blue/Orange
      default:
        return 0x888888;
    }
  };

  useEffect(() => {
    if (viewMode !== '3D' || !containerRef.current) return;

    const width = containerRef.current.clientWidth;
    const height = containerRef.current.clientHeight || 550;

    // 1. Scene setup
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x121212);
    scene.fog = new THREE.FogExp2(0x121212, 0.04);

    // 2. Camera setup
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    const initialCamPos = new THREE.Vector3(0, 14, 18);
    camera.position.copy(initialCamPos);

    const initialLookAt = new THREE.Vector3(0, 0, 0);
    camera.lookAt(initialLookAt);

    // 3. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    containerRef.current.replaceChildren(renderer.domElement);

    // 4. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambientLight);

    const mainSpot = new THREE.SpotLight(0xffffff, 1.8);
    mainSpot.position.set(0, 20, 10);
    mainSpot.angle = Math.PI / 4;
    mainSpot.penumbra = 0.6;
    mainSpot.castShadow = true;
    mainSpot.shadow.mapSize.width = 1024;
    mainSpot.shadow.mapSize.height = 1024;
    scene.add(mainSpot);

    const redAccent = new THREE.PointLight(0xff0000, 1.2, 25);
    redAccent.position.set(-8, 6, -6);
    scene.add(redAccent);

    // 5. Floor & Floor grid
    const floorGeo = new THREE.PlaneGeometry(28, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      color: 0x161616,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    const gridHelper = new THREE.GridHelper(28, 28, 0x2e2e2e, 0x1e1e1e);
    gridHelper.position.y = 0.01;
    scene.add(gridHelper);

    // 6. Bar Counter & Kitchen Wall Backdrop (Atmosphere)
    const counterGeo = new THREE.BoxGeometry(16, 2, 2);
    const counterMat = new THREE.MeshStandardMaterial({ color: 0x1f1f1f, roughness: 0.5 });
    const counter = new THREE.Mesh(counterGeo, counterMat);
    counter.position.set(0, 1, -8);
    counter.castShadow = true;
    counter.receiveShadow = true;
    scene.add(counter);

    // Counter top neon strip
    const neonGeo = new THREE.BoxGeometry(16.1, 0.1, 2.1);
    const neonMat = new THREE.MeshBasicMaterial({ color: 0xff0000 });
    const neon = new THREE.Mesh(neonGeo, neonMat);
    neon.position.set(0, 2.05, -8);
    scene.add(neon);

    // 7. Render 3D Tables from branch tables
    const tableMeshes = new Map<string, THREE.Group>();

    branchTables.forEach((tbl) => {
      const tableGroup = new THREE.Group();
      tableGroup.name = tbl.id;
      tableGroup.position.set(tbl.positionX, 0, tbl.positionZ);

      const statusColor = getStatusColor(tbl.status);

      // Tabletop
      let topMesh: THREE.Mesh;
      if (tbl.shape === 'round') {
        const topGeo = new THREE.CylinderGeometry(1.2, 1.2, 0.15, 32);
        const topMat = new THREE.MeshStandardMaterial({ color: 0x242424, roughness: 0.3 });
        topMesh = new THREE.Mesh(topGeo, topMat);
      } else {
        const topGeo = new THREE.BoxGeometry(2.2, 0.15, 2.2);
        const topMat = new THREE.MeshStandardMaterial({ color: 0x242424, roughness: 0.3 });
        topMesh = new THREE.Mesh(topGeo, topMat);
      }
      topMesh.position.y = 1.4;
      topMesh.castShadow = true;
      topMesh.receiveShadow = true;
      tableGroup.add(topMesh);

      // Table leg
      const legGeo = new THREE.CylinderGeometry(0.12, 0.18, 1.4, 16);
      const legMat = new THREE.MeshStandardMaterial({ color: 0x111111, metalness: 0.8 });
      const leg = new THREE.Mesh(legGeo, legMat);
      leg.position.y = 0.7;
      tableGroup.add(leg);

      // Glowing status ring around base
      const ringGeo = new THREE.RingGeometry(1.4, 1.55, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: statusColor,
        side: THREE.DoubleSide,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = -Math.PI / 2;
      ring.position.y = 0.02;
      tableGroup.add(ring);

      // Small center candle / light emitter on table
      const candleGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.25, 12);
      const candleMat = new THREE.MeshBasicMaterial({ color: statusColor });
      const candle = new THREE.Mesh(candleGeo, candleMat);
      candle.position.y = 1.55;
      tableGroup.add(candle);

      // Chairs around table
      const chairDistance = 1.6;
      const chairCount = tbl.capacity;
      for (let i = 0; i < chairCount; i++) {
        const angle = (i / chairCount) * Math.PI * 2;
        const chairGeo = new THREE.BoxGeometry(0.6, 0.8, 0.6);
        const chairMat = new THREE.MeshStandardMaterial({ color: 0x1b1b1b, roughness: 0.7 });
        const chair = new THREE.Mesh(chairGeo, chairMat);
        chair.position.set(
          Math.cos(angle) * chairDistance,
          0.4,
          Math.sin(angle) * chairDistance
        );
        chair.rotation.y = -angle + Math.PI / 2;
        chair.castShadow = true;
        tableGroup.add(chair);
      }

      scene.add(tableGroup);
      tableMeshes.set(tbl.id, tableGroup);
    });

    const targetCameraPos = initialCamPos.clone();
    const targetLookAt = initialLookAt.clone();
    const currentLookAt = initialLookAt.clone();

    threeRef.current = {
      scene,
      camera,
      renderer,
      tableMeshes,
      targetCameraPos,
      targetLookAt,
      currentLookAt,
    };

    // 8. Interactive Raycasting
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    const handlePointerMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const groups = Array.from(tableMeshes.values());
      const intersects = raycaster.intersectObjects(groups, true);

      if (intersects.length > 0) {
        let parentGroup: THREE.Object3D | null = intersects[0].object;
        while (parentGroup && !tableMeshes.has(parentGroup.name)) {
          parentGroup = parentGroup.parent;
        }
        if (parentGroup && tableMeshes.has(parentGroup.name)) {
          const foundTable = branchTables.find((t) => t.id === parentGroup?.name);
          if (foundTable) {
            setHoveredTable(foundTable);
            setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
            containerRef.current.style.cursor = 'pointer';
            return;
          }
        }
      }
      setHoveredTable(null);
      setTooltipPos(null);
      if (containerRef.current) containerRef.current.style.cursor = 'default';
    };

    const handlePointerDown = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const groups = Array.from(tableMeshes.values());
      const intersects = raycaster.intersectObjects(groups, true);

      if (intersects.length > 0) {
        let parentGroup: THREE.Object3D | null = intersects[0].object;
        while (parentGroup && !tableMeshes.has(parentGroup.name)) {
          parentGroup = parentGroup.parent;
        }
        if (parentGroup && tableMeshes.has(parentGroup.name)) {
          const found = branchTables.find((t) => t.id === parentGroup?.name);
          if (found) {
            setSelectedTable(found);
            setSelectedTableId(found.id);

            // Smooth camera move toward selected table
            targetCameraPos.set(found.positionX, 7, found.positionZ + 8);
            targetLookAt.set(found.positionX, 1, found.positionZ);
          }
        }
      }
    };

    const domElement = containerRef.current;
    domElement.addEventListener('mousemove', handlePointerMove);
    domElement.addEventListener('click', handlePointerDown);

    // 9. Animation loop with smooth camera lerping
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Smooth camera interpolation
      camera.position.lerp(targetCameraPos, 0.05);
      currentLookAt.lerp(targetLookAt, 0.05);
      camera.lookAt(currentLookAt);

      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight || 550;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      domElement.removeEventListener('mousemove', handlePointerMove);
      domElement.removeEventListener('click', handlePointerDown);
      renderer.dispose();
    };
  }, [viewMode, branchTables, currentBranch.id]);

  const resetCamera = () => {
    if (!threeRef.current) return;
    threeRef.current.targetCameraPos.set(0, 14, 18);
    threeRef.current.targetLookAt.set(0, 0, 0);
    setSelectedTable(null);
  };

  const zoomCamera = (delta: number) => {
    if (!threeRef.current) return;
    threeRef.current.targetCameraPos.y = Math.max(
      4,
      Math.min(25, threeRef.current.targetCameraPos.y + delta)
    );
    threeRef.current.targetCameraPos.z = Math.max(
      6,
      Math.min(30, threeRef.current.targetCameraPos.z + delta)
    );
  };

  return (
    <div className="flex-1 flex flex-col min-w-0">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
            Restaurant Floor & Tables
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#1E1E1E] text-[#A0A0A0] border border-[#2A2A2A]">
              {branchTables.length} Tables
            </span>
          </h2>
          <p className="text-xs text-[#808080] mt-0.5">
            {currentBranch.name} • Interactive real-time table layout
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Status legend */}
          <div className="hidden xl:flex items-center gap-3 bg-[#181818] border border-[#262626] rounded-xl px-3 py-1.5 text-[11px]">
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-[#06990F]"></span> Available
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FF0000]"></span> Booked
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-[#FFFF00]"></span> Pending
            </span>
            <span className="flex items-center gap-1.5 text-white">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500"></span> Occupied
            </span>
          </div>

          {/* 3D vs 2D View Switcher */}
          <div className="bg-[#181818] border border-[#2A2A2A] rounded-xl p-1 flex items-center gap-1">
            <button
              onClick={() => setViewMode('3D')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === '3D' ? 'bg-[#282828] text-white shadow-sm' : 'text-[#808080] hover:text-white'
              }`}
            >
              <Box size={14} className={viewMode === '3D' ? 'text-[#FF0000]' : ''} /> 3D View
            </button>
            <button
              onClick={() => setViewMode('2D')}
              className={`text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all ${
                viewMode === '2D' ? 'bg-[#282828] text-white shadow-sm' : 'text-[#808080] hover:text-white'
              }`}
            >
              <Grid size={14} className={viewMode === '2D' ? 'text-[#FF0000]' : ''} /> 2D Grid
            </button>
          </div>

          {onOpenAddTable && (
            <button
              onClick={onOpenAddTable}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-[#1E1E1E] hover:bg-[#252525] text-white border border-[#2A2A2A] flex items-center gap-1.5 transition-colors"
            >
              <Plus size={14} className="text-[#FF0000]" /> Add Table
            </button>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="flex-1 min-h-[500px] bg-[#141414] border border-[#262626] rounded-3xl overflow-hidden relative flex flex-col">
        {viewMode === '3D' ? (
          <div className="relative flex-1 w-full h-full min-h-[550px]">
            {/* 3D Canvas element rendered by Three.js */}
            <div ref={containerRef} className="w-full h-full min-h-[550px]" />

            {/* Hover Tooltip */}
            {hoveredTable && tooltipPos && (
              <div
                className="absolute z-20 pointer-events-none bg-black/90 backdrop-blur-md border border-[#333333] rounded-xl px-3 py-2 shadow-xl -translate-x-1/2 -translate-y-full mb-3"
                style={{ left: tooltipPos.x, top: tooltipPos.y }}
              >
                <div className="text-xs font-bold text-white flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{
                      backgroundColor:
                        hoveredTable.status === 'Available'
                          ? '#06990F'
                          : hoveredTable.status === 'Booked'
                          ? '#FF0000'
                          : hoveredTable.status === 'Pending'
                          ? '#FFFF00'
                          : '#3B82F6',
                    }}
                  />
                  {hoveredTable.tableNumber}
                </div>
                <div className="text-[10px] text-[#A0A0A0] mt-0.5">
                  {hoveredTable.capacity} Seats • {hoveredTable.location}
                </div>
                <div className="text-[10px] font-semibold text-white/90 mt-1 uppercase">
                  Status: {hoveredTable.status}
                </div>
              </div>
            )}

            {/* 3D Floating Camera HUD Controls */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-[#181818]/90 backdrop-blur-md border border-[#2A2A2A] rounded-2xl p-1.5 shadow-xl">
              <button
                onClick={resetCamera}
                className="p-2 rounded-xl text-[#A0A0A0] hover:text-white hover:bg-[#252525] transition-colors"
                title="Reset Camera Angle"
              >
                <RotateCcw size={16} />
              </button>
              <button
                onClick={() => zoomCamera(-3)}
                className="p-2 rounded-xl text-[#A0A0A0] hover:text-white hover:bg-[#252525] transition-colors"
                title="Zoom In"
              >
                <ZoomIn size={16} />
              </button>
              <button
                onClick={() => zoomCamera(3)}
                className="p-2 rounded-xl text-[#A0A0A0] hover:text-white hover:bg-[#252525] transition-colors"
                title="Zoom Out"
              >
                <ZoomOut size={16} />
              </button>
            </div>

            {/* 3D Helper banner */}
            <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md border border-white/10 rounded-xl px-3 py-1.5 text-[11px] text-[#A0A0A0]">
              Click any 3D table to focus camera & manage operational details
            </div>
          </div>
        ) : (
          /* 2D Fast Operations Table Grid */
          <div className="p-6 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {branchTables.map((tbl) => {
                const isSelected = selectedTable?.id === tbl.id;
                return (
                  <div
                    key={tbl.id}
                    onClick={() => setSelectedTable(tbl)}
                    className={`p-4 rounded-2xl bg-[#1A1A1A] border transition-all cursor-pointer flex flex-col justify-between ${
                      isSelected
                        ? 'border-[#FF0000] shadow-lg shadow-[#FF0000]/10'
                        : 'border-[#262626] hover:border-[#383838]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-mono text-sm font-bold text-white">
                          {tbl.tableNumber}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            tbl.status === 'Available'
                              ? 'bg-[#06990F]/20 text-[#06990F] border border-[#06990F]/30'
                              : tbl.status === 'Booked'
                              ? 'bg-[#FF0000]/20 text-[#FF0000] border border-[#FF0000]/30'
                              : tbl.status === 'Pending'
                              ? 'bg-[#FFFF00]/20 text-[#FFFF00] border border-[#FFFF00]/30'
                              : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                          }`}
                        >
                          {tbl.status}
                        </span>
                      </div>

                      <div className="text-xs text-[#808080] mb-1">
                        Location: <span className="text-white/80">{tbl.location}</span>
                      </div>
                      <div className="text-xs text-[#808080] mb-3">
                        Capacity: <span className="text-white/80">{tbl.capacity} Persons</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 pt-3 border-t border-[#262626]">
                      {onOpenTableQR && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenTableQR(tbl);
                          }}
                          className="p-1.5 rounded-lg bg-[#222222] hover:bg-[#2A2A2A] text-[#A0A0A0] hover:text-white"
                          title="View Table QR Code"
                        >
                          <QrCode size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          updateTableStatus(
                            tbl.id,
                            tbl.status === 'Available' ? 'Booked' : 'Available'
                          );
                        }}
                        className="flex-1 text-center py-1.5 px-2 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-xs font-semibold text-white transition-colors"
                      >
                        Toggle Status
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Table 2D Operational Drawer */}
        {selectedTable && (
          <div className="bg-[#181818] border-t border-[#2A2A2A] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 z-20">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#222222] border border-[#333333] flex items-center justify-center text-white font-mono font-bold text-base shrink-0">
                {selectedTable.tableNumber.replace(/Black Plate\s*|Table\s*/i, 'T')}
              </div>
              <div>
                <h4 className="font-bold text-white text-sm flex items-center gap-2">
                  {selectedTable.tableNumber}
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                      selectedTable.status === 'Available'
                        ? 'bg-[#06990F]/20 text-[#06990F]'
                        : selectedTable.status === 'Booked'
                        ? 'bg-[#FF0000]/20 text-[#FF0000]'
                        : selectedTable.status === 'Pending'
                        ? 'bg-[#FFFF00]/20 text-[#FFFF00]'
                        : 'bg-blue-500/20 text-blue-400'
                    }`}
                  >
                    {selectedTable.status}
                  </span>
                </h4>
                <div className="text-xs text-[#808080]">
                  Capacity: {selectedTable.capacity} guests • {selectedTable.location}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <select
                value={selectedTable.status}
                onChange={(e) => {
                  const newStatus = e.target.value as TableStatus;
                  updateTableStatus(selectedTable.id, newStatus);
                  setSelectedTable({ ...selectedTable, status: newStatus });
                }}
                className="bg-[#222222] border border-[#333333] rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none"
              >
                <option value="Available">Available (Green)</option>
                <option value="Booked">Booked (Red)</option>
                <option value="Pending">Pending (Yellow)</option>
                <option value="Occupied">Occupied (Blue)</option>
              </select>

              {onOpenTableQR && (
                <button
                  onClick={() => onOpenTableQR(selectedTable)}
                  className="px-3 py-1.5 rounded-xl bg-[#242424] hover:bg-[#2E2E2E] text-white text-xs font-semibold border border-[#333333] flex items-center gap-1.5"
                >
                  <QrCode size={14} /> Table QR
                </button>
              )}

              {onTableAction && (
                <button
                  onClick={() => onTableAction(selectedTable)}
                  className="px-4 py-1.5 rounded-xl bg-[#FF0000] hover:bg-[#D60000] text-white text-xs font-bold transition-colors"
                >
                  Start Order for Table
                </button>
              )}

              <button
                onClick={() => setSelectedTable(null)}
                className="px-3 py-1.5 rounded-xl bg-[#242424] hover:bg-[#2E2E2E] text-[#808080] hover:text-white text-xs"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

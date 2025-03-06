'use client';

import MapControls from '@/components/map/map-controls';
import { MapVectorBackground } from '@/components/map/map-vector-background';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { sanitizeMapData } from '@/lib/map-utils';
import {
  Center,
  Corner,
  Edge,
  MapConfig,
  MapViewType,
} from '@/types/map-types';
import { generateMap } from '@/utils/map-generation';
import { POI, POIGraph, generatePOIs } from '@/utils/poi-generation';
import {
  Controls,
  ReactFlow as Flow,
  Node,
  Panel,
  Edge as ReactFlowEdge,
  ReactFlowProvider,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

export default function MapCreatePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [centers, setCenters] = useState<Center[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [corners, setCorners] = useState<Corner[]>([]);
  const [view, setView] = useState<MapViewType>('biomes');
  const [poiGraph, setPoiGraph] = useState<POIGraph | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  // Default configuration
  const [config, setConfig] = useState<MapConfig>({
    width: 800,
    height: 600,
    numPoints: 1200,
    islandFactor: 1.1,
    relaxationIterations: 2,
    lakeProbability: 0.15,
    riverCount: 50,
    // New parameters for complex island generation
    islandShape: 'complex',
    noiseSeed: Math.random() * 10000,
    noiseScale: 4,
    noiseIntensity: 0.3,
    islandCount: 3,
    coastalNoiseFrequency: 8,
    poiCounts: {
      town: 8,
      forest: 6,
      mountain: 4,
      lake: 3,
      castle: 4,
      cave: 4,
      ruins: 5,
      camp: 10,
      oasis: 2,
    },
  });

  // Generate a new map
  const handleGenerateMap = async () => {
    setIsGenerating(true);

    // Clear POIs when generating a new map
    setPoiGraph(null);
    setSelectedPOI(null);

    // Generate map with a timeout to allow UI to update
    setTimeout(async () => {
      try {
        // Generate base map
        const { centers, edges, corners } = generateMap(config);
        setCenters(centers);
        setEdges(edges);
        setCorners(corners);

        // Generate POIs
        try {
          const pois = await generatePOIs(centers, {
            poiCounts: config.poiCounts || {
              town: 8,
              forest: 6,
              mountain: 4,
              lake: 3,
              castle: 2,
              cave: 4,
              ruins: 5,
              camp: 7,
              oasis: 2,
            },
            initialLocation: 'town',
            minDistanceBetweenPOIs: 10,
            maxConnectionDistance: 30,
            skipLLMGeneration: true, // Skip LLM generation during development
          });

          setPoiGraph(pois);
        } catch (error) {
          console.error('Failed to generate POIs:', error);
        }

        setIsGenerating(false);
      } catch (error) {
        console.error('Error generating map:', error);
        setIsGenerating(false);
      }
    }, 10);
  };

  // Save the current map
  const handleSaveMap = async () => {
    if (!poiGraph?.nodes || centers.length === 0) {
      toast.error('Please generate a map first');
      return;
    }

    setIsSaving(true);
    try {
      // Sanitize the map data to remove circular references
      // before sending to the API
      const { sanitizedCenters, sanitizedEdges, sanitizedCorners } =
        sanitizeMapData(centers, edges, corners);

      // Build the request payload
      const payload = {
        centers: sanitizedCenters,
        edges: sanitizedEdges,
        corners: sanitizedCorners,
        width: config.width,
        height: config.height,
        locations: poiGraph.nodes.map((poi) => ({
          id: poi.id,
          name: poi.name,
          description: poi.description || '',
          locationType: poi.locationType,
          position: poi.position,
          isInitialNode: poi.isInitialNode || false,
          appearance: poi.appearance,
          keyCharacteristics: poi.keyCharacteristics,
          loreHistory: poi.loreHistory,
          culture: poi.culture,
        })),
        poiEdges: poiGraph.edges,
        config: {
          islandFactor: config.islandFactor,
          relaxationIterations: config.relaxationIterations,
          lakeProbability: config.lakeProbability,
          riverCount: config.riverCount,
          islandShape: config.islandShape,
          noiseSeed: config.noiseSeed,
          noiseScale: config.noiseScale,
          noiseIntensity: config.noiseIntensity,
          islandCount: config.islandCount,
          coastalNoiseFrequency: config.coastalNoiseFrequency,
        },
      };

      // Call the API endpoint
      const response = await fetch('/api/maps/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (result.success) {
        toast.success('Map saved successfully!');
        // Navigate back to the map view
        router.push('/map');
      } else {
        toast.error(`Failed to save map: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving map:', error);
      toast.error('Failed to save map');
    } finally {
      setIsSaving(false);
    }
  };

  const handleSelectPOI = (poi: POI) => {
    setSelectedPOI(poi);
    setSheetOpen(true);
  };

  // Handle view change
  const handleViewChange = (newView: MapViewType) => {
    setView(newView);
  };

  // Download map as PNG
  const downloadMap = () => {
    // Create an SVG string from our map data
    const svgElement = document.querySelector(
      '.react-flow__map-vector-background svg'
    );
    if (!svgElement) return;

    // Clone the SVG so we can modify it for export
    const svgClone = svgElement.cloneNode(true) as SVGElement;
    svgClone.setAttribute('width', config.width.toString());
    svgClone.setAttribute('height', config.height.toString());

    // Create a data URL from the SVG
    const svgData = new XMLSerializer().serializeToString(svgClone);
    const svgBlob = new Blob([svgData], {
      type: 'image/svg+xml;charset=utf-8',
    });
    const url = URL.createObjectURL(svgBlob);

    // Create download link
    const link = document.createElement('a');
    link.download = 'generated-map.svg';
    link.href = url;
    link.click();

    // Clean up
    URL.revokeObjectURL(url);
  };

  // Generate initial map on mount
  useEffect(() => {
    handleGenerateMap();
    // Empty dependency array to run only once on mount
  }, []);

  // Empty nodes and edges for ReactFlow (we're just using it for the viewport)
  const nodes: Node[] = [];
  const reactFlowEdges: ReactFlowEdge[] = [];

  return (
    <div className='relative h-screen w-full'>
      <ReactFlowProvider>
        <Flow
          nodes={nodes}
          edges={reactFlowEdges}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          zoomOnScroll={true}
          minZoom={0.5}
          maxZoom={10}
          proOptions={{ hideAttribution: true }}
          className='h-full w-full'
        >
          {centers.length > 0 && (
            <MapVectorBackground
              centers={centers}
              edges={edges}
              corners={corners}
              view={view}
              width={config.width}
              height={config.height}
              poiGraph={poiGraph}
              onSelectPOI={handleSelectPOI}
            />
          )}

          <Controls showInteractive={false} />

          <Panel
            position='top-left'
            className='rounded-md bg-white/90 p-2 text-xs text-gray-500 shadow-sm backdrop-blur-sm'
          >
            Use mouse wheel to zoom and drag to pan
          </Panel>

          {/* Map Controls Panel */}
          <Panel
            position='top-right'
            className='max-h-[90vh] w-80 overflow-y-auto rounded-md bg-white/95 p-4 shadow-md backdrop-blur-sm'
          >
            <h2 className='mb-4 text-lg font-semibold'>Map Controls</h2>
            <MapControls
              config={config}
              setConfig={setConfig}
              isGenerating={isGenerating}
              view={view}
              onViewChange={handleViewChange}
              onGenerate={handleGenerateMap}
              onDownload={downloadMap}
            />
            <div className='mt-4 flex gap-2'>
              <Button
                onClick={handleSaveMap}
                disabled={
                  isGenerating ||
                  isSaving ||
                  !poiGraph?.nodes ||
                  centers.length === 0
                }
                className='w-full'
              >
                {isSaving ? 'Saving...' : 'Save Map'}
              </Button>
            </div>
          </Panel>
        </Flow>
      </ReactFlowProvider>

      {/* POI Details Sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent>
          {selectedPOI && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedPOI.name}</SheetTitle>
                <SheetDescription>
                  <Badge variant='outline'>{selectedPOI.locationType}</Badge>
                </SheetDescription>
              </SheetHeader>
              <div className='p-4 pb-0'>
                <div className='space-y-4'>
                  <div>
                    <h4 className='mb-1 font-medium'>Description</h4>
                    <p className='text-sm text-muted-foreground'>
                      {selectedPOI.description}
                    </p>
                  </div>

                  <div>
                    <h4 className='mb-1 font-medium'>Appearance</h4>
                    <p className='text-sm text-muted-foreground'>
                      {selectedPOI.appearance}
                    </p>
                  </div>

                  <div>
                    <h4 className='mb-1 font-medium'>Key Characteristics</h4>
                    <p className='text-sm text-muted-foreground'>
                      {selectedPOI.keyCharacteristics}
                    </p>
                  </div>

                  <div>
                    <h4 className='mb-1 font-medium'>Lore & History</h4>
                    <p className='text-sm text-muted-foreground'>
                      {selectedPOI.loreHistory}
                    </p>
                  </div>

                  <div>
                    <h4 className='mb-1 font-medium'>Culture</h4>
                    <p className='text-sm text-muted-foreground'>
                      {selectedPOI.culture}
                    </p>
                  </div>
                </div>
              </div>
              <SheetFooter>
                <Button onClick={() => setSheetOpen(false)}>Close</Button>
              </SheetFooter>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}

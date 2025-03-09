'use client';

import MapControls from '@/components/map/map-controls';
import { MapVectorBackground } from '@/components/map/map-vector-background';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
import { createClient } from '@/lib/supabase/client';
import { Center, Corner, Edge, MapConfig } from '@/types/map-types';
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
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

export default function MapCreatePage() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [centers, setCenters] = useState<Center[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [corners, setCorners] = useState<Corner[]>([]);
  const view = 'stylized';
  const [poiGraph, setPoiGraph] = useState<POIGraph | null>(null);
  const [selectedPOI, setSelectedPOI] = useState<POI | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [statusText, setStatusText] = useState<string | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const worldIdRef = useRef<string | null>(null);

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

  // Function to poll status updates from the server
  const pollStatusUpdates = async () => {
    if (!worldIdRef.current) return;

    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('worlds')
        .select('status_text')
        .eq('id', worldIdRef.current)
        .single();

      if (error) {
        console.error('Error polling status:', error);
        return;
      }

      if (data && data.status_text) {
        setStatusText(data.status_text);

        // If status indicates completion, stop polling
        if (data.status_text.includes('completed successfully')) {
          if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
          }
        }
      }
    } catch (error) {
      console.error('Error in status polling:', error);
    }
  };

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Save the current map
  const handleSaveMap = async () => {
    if (!poiGraph?.nodes || centers.length === 0) {
      toast.error('Please generate a map first');
      return;
    }

    setIsSaving(true);
    setStatusText('Initializing map save...');

    try {
      // Get current classroom info to find the world ID
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        toast.error('You must be logged in to save a map');
        return;
      }

      // Get classroom for teacher
      /* TODO : (When we have teacher/student roles) const { data: classroom } = await supabase
        .from('classrooms')
        .select('id')
        .eq('teacher_id', user.id)
        .single(); */

      const classroom = {
        id: '10000000-0000-0000-0000-000000000001',
      };

      if (!classroom) {
        toast.error('No classroom found for this account');
        return;
      }

      // Get world for classroom
      const { data: world } = await supabase
        .from('worlds')
        .select('id')
        .eq('classroom_id', classroom.id)
        .single();

      if (!world) {
        toast.error('No world found for classroom');
        return;
      }

      // Store world ID for polling
      worldIdRef.current = world.id;

      // Start polling for status updates
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }

      pollingIntervalRef.current = setInterval(pollStatusUpdates, 1000);

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
        // Stop polling
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        // Navigate back to the map view
        router.push('/map');
      } else {
        toast.error(`Failed to save map: ${result.error}`);
        // Stop polling on error
        if (pollingIntervalRef.current) {
          clearInterval(pollingIntervalRef.current);
          pollingIntervalRef.current = null;
        }
        setStatusText(null);
      }
    } catch (error) {
      console.error('Error saving map:', error);
      toast.error('Failed to save map');
      // Stop polling on error
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      setStatusText(null);
    } finally {
      // Note: we don't set isSaving to false here because we want to show
      // the saving state until navigation happens or an error occurs
      if (!pollingIntervalRef.current) {
        setIsSaving(false);
      }
    }
  };

  const handleSelectPOI = (poi: POI) => {
    setSelectedPOI(poi);
    setSheetOpen(true);
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
    <div className='relative h-screen w-full bg-background text-foreground'>
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
            className='rounded-md bg-background/90 p-2 text-xs text-muted-foreground shadow-sm backdrop-blur-sm'
          >
            Use mouse wheel to zoom and drag to pan
          </Panel>

          {/* Map Controls Panel */}
          <Panel
            position='top-right'
            className='max-h-[90vh] w-80 overflow-y-auto rounded-md bg-background/95 p-4 shadow-md backdrop-blur-sm'
          >
            <h2 className='mb-4 text-lg font-semibold'>Map Controls</h2>
            <MapControls
              config={config}
              setConfig={setConfig}
              isGenerating={isGenerating}
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
        <SheetContent className="bg-background text-foreground">
          {selectedPOI && (
            <>
              <SheetHeader>
                <SheetTitle>{selectedPOI.name}</SheetTitle>
                <SheetDescription className="text-muted-foreground">
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

      {/* Display save status */}
      {isSaving && statusText && (
        <div className='fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md'>
          <Alert variant="default" className="border bg-background">
            <div className='flex items-center gap-2'>
              <Loader2 className='h-4 w-4 animate-spin text-primary' />
              <AlertDescription className='font-medium text-foreground'>
                {statusText}
              </AlertDescription>
            </div>
          </Alert>
        </div>
      )}
    </div>
  );
}

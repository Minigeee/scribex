import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MapConfig, MapViewType } from '@/types/map-types';
import { Download, Loader2, RefreshCw } from 'lucide-react';
import React, { useCallback } from 'react';

type MapControlsProps = {
  config: MapConfig;
  setConfig: React.Dispatch<React.SetStateAction<MapConfig>>;
  isGenerating: boolean;
  view?: MapViewType;
  onViewChange?: (view: MapViewType) => void;
  onGenerate: () => void;
  onDownload: () => void;
};

const MapControls = ({
  config,
  setConfig,
  isGenerating,
  onGenerate,
  onDownload,
}: MapControlsProps) => {
  const handleConfigChange = (key: keyof MapConfig, value: number) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  const toggleIslandShape = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      islandShape: prev.islandShape === 'complex' ? 'radial' : 'complex',
    }));
  }, [setConfig]);

  const resetNoiseSeed = useCallback(() => {
    setConfig((prev) => ({
      ...prev,
      noiseSeed: Math.random() * 10000,
    }));
  }, [setConfig]);

  return (
    <div className='w-full max-w-xs space-y-4'>
      <div className='space-y-2'>
        <h2 className='text-xl font-bold'>Map Generator</h2>
        <p className='text-sm text-muted-foreground'>
          Adjust parameters to create a custom fantasy map
        </p>
      </div>

      <Separator />

      <div className='space-y-4'>
        <div className='space-y-2'>
          <Label htmlFor='numPoints'>
            Number of Points ({config.numPoints})
          </Label>
          <Slider
            id='numPoints'
            min={300}
            max={2500}
            step={100}
            value={[config.numPoints]}
            onValueChange={(value) => handleConfigChange('numPoints', value[0])}
          />
          <p className='text-xs text-muted-foreground'>
            More points create a more detailed map but generate slower
          </p>
        </div>

        <div className='space-y-2'>
          <Label>POI Settings</Label>
          <Tabs defaultValue='town' className='w-full'>
            <TabsList className='grid w-full grid-cols-3'>
              <TabsTrigger value='town'>Settlements</TabsTrigger>
              <TabsTrigger value='nature'>Nature</TabsTrigger>
              <TabsTrigger value='landmarks'>Landmarks</TabsTrigger>
            </TabsList>

            <TabsContent value='town' className='space-y-3 pt-2'>
              <div className='space-y-2'>
                <Label htmlFor='poiTownCount'>
                  Towns ({config.poiCounts?.town || 8})
                </Label>
                <Slider
                  id='poiTownCount'
                  min={0}
                  max={20}
                  step={1}
                  value={[config.poiCounts?.town || 8]}
                  onValueChange={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      poiCounts: {
                        ...(prev.poiCounts || {
                          town: 8,
                          forest: 6,
                          mountain: 4,
                          lake: 3,
                          castle: 2,
                          cave: 4,
                          ruins: 5,
                          camp: 7,
                          oasis: 2,
                        }),
                        town: value[0],
                      },
                    }));
                  }}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='poiCampCount'>
                  Camps ({config.poiCounts?.camp || 7})
                </Label>
                <Slider
                  id='poiCampCount'
                  min={0}
                  max={15}
                  step={1}
                  value={[config.poiCounts?.camp || 7]}
                  onValueChange={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      poiCounts: {
                        ...(prev.poiCounts || {
                          town: 8,
                          forest: 6,
                          mountain: 4,
                          lake: 3,
                          castle: 2,
                          cave: 4,
                          ruins: 5,
                          camp: 7,
                          oasis: 2,
                        }),
                        camp: value[0],
                      },
                    }));
                  }}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='poiCastleCount'>
                  Castles ({config.poiCounts?.castle || 2})
                </Label>
                <Slider
                  id='poiCastleCount'
                  min={0}
                  max={10}
                  step={1}
                  value={[config.poiCounts?.castle || 2]}
                  onValueChange={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      poiCounts: {
                        ...(prev.poiCounts || {
                          town: 8,
                          forest: 6,
                          mountain: 4,
                          lake: 3,
                          castle: 2,
                          cave: 4,
                          ruins: 5,
                          camp: 7,
                          oasis: 2,
                        }),
                        castle: value[0],
                      },
                    }));
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value='nature' className='space-y-3 pt-2'>
              <div className='space-y-2'>
                <Label htmlFor='poiForestCount'>
                  Forests ({config.poiCounts?.forest || 6})
                </Label>
                <Slider
                  id='poiForestCount'
                  min={0}
                  max={15}
                  step={1}
                  value={[config.poiCounts?.forest || 6]}
                  onValueChange={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      poiCounts: {
                        ...(prev.poiCounts || {
                          town: 8,
                          forest: 6,
                          mountain: 4,
                          lake: 3,
                          castle: 2,
                          cave: 4,
                          ruins: 5,
                          camp: 7,
                          oasis: 2,
                        }),
                        forest: value[0],
                      },
                    }));
                  }}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='poiMountainCount'>
                  Mountains ({config.poiCounts?.mountain || 4})
                </Label>
                <Slider
                  id='poiMountainCount'
                  min={0}
                  max={12}
                  step={1}
                  value={[config.poiCounts?.mountain || 4]}
                  onValueChange={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      poiCounts: {
                        ...(prev.poiCounts || {
                          town: 8,
                          forest: 6,
                          mountain: 4,
                          lake: 3,
                          castle: 2,
                          cave: 4,
                          ruins: 5,
                          camp: 7,
                          oasis: 2,
                        }),
                        mountain: value[0],
                      },
                    }));
                  }}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='poiLakeCount'>
                  Lakes ({config.poiCounts?.lake || 3})
                </Label>
                <Slider
                  id='poiLakeCount'
                  min={0}
                  max={10}
                  step={1}
                  value={[config.poiCounts?.lake || 3]}
                  onValueChange={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      poiCounts: {
                        ...(prev.poiCounts || {
                          town: 8,
                          forest: 6,
                          mountain: 4,
                          lake: 3,
                          castle: 2,
                          cave: 4,
                          ruins: 5,
                          camp: 7,
                          oasis: 2,
                        }),
                        lake: value[0],
                      },
                    }));
                  }}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='poiOasisCount'>
                  Oases ({config.poiCounts?.oasis || 2})
                </Label>
                <Slider
                  id='poiOasisCount'
                  min={0}
                  max={8}
                  step={1}
                  value={[config.poiCounts?.oasis || 2]}
                  onValueChange={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      poiCounts: {
                        ...(prev.poiCounts || {
                          town: 8,
                          forest: 6,
                          mountain: 4,
                          lake: 3,
                          castle: 2,
                          cave: 4,
                          ruins: 5,
                          camp: 7,
                          oasis: 2,
                        }),
                        oasis: value[0],
                      },
                    }));
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value='landmarks' className='space-y-3 pt-2'>
              <div className='space-y-2'>
                <Label htmlFor='poiCaveCount'>
                  Caves ({config.poiCounts?.cave || 4})
                </Label>
                <Slider
                  id='poiCaveCount'
                  min={0}
                  max={12}
                  step={1}
                  value={[config.poiCounts?.cave || 4]}
                  onValueChange={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      poiCounts: {
                        ...(prev.poiCounts || {
                          town: 8,
                          forest: 6,
                          mountain: 4,
                          lake: 3,
                          castle: 2,
                          cave: 4,
                          ruins: 5,
                          camp: 7,
                          oasis: 2,
                        }),
                        cave: value[0],
                      },
                    }));
                  }}
                />
              </div>

              <div className='space-y-2'>
                <Label htmlFor='poiRuinsCount'>
                  Ruins ({config.poiCounts?.ruins || 5})
                </Label>
                <Slider
                  id='poiRuinsCount'
                  min={0}
                  max={12}
                  step={1}
                  value={[config.poiCounts?.ruins || 5]}
                  onValueChange={(value) => {
                    setConfig((prev) => ({
                      ...prev,
                      poiCounts: {
                        ...(prev.poiCounts || {
                          town: 8,
                          forest: 6,
                          mountain: 4,
                          lake: 3,
                          castle: 2,
                          cave: 4,
                          ruins: 5,
                          camp: 7,
                          oasis: 2,
                        }),
                        ruins: value[0],
                      },
                    }));
                  }}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>

        <div className='space-y-2'>
          <div className='flex items-center justify-between'>
            <Label htmlFor='islandShape'>Complex Island Shape</Label>
            <Switch
              id='islandShape'
              checked={config.islandShape === 'complex'}
              onCheckedChange={toggleIslandShape}
            />
          </div>
          <p className='text-xs text-muted-foreground'>
            Toggle between simple radial and complex island generation
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='islandFactor'>
            Island Factor ({config.islandFactor.toFixed(2)})
          </Label>
          <Slider
            id='islandFactor'
            min={1}
            max={2}
            step={0.05}
            value={[config.islandFactor]}
            onValueChange={(value) =>
              handleConfigChange('islandFactor', value[0])
            }
          />
          <p className='text-xs text-muted-foreground'>
            Higher values create smaller, more centered islands
          </p>
        </div>

        {config.islandShape === 'complex' && (
          <>
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <Label htmlFor='noiseSeed'>Noise Seed</Label>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={resetNoiseSeed}
                  className='h-8'
                >
                  Randomize
                </Button>
              </div>
              <p className='text-xs text-muted-foreground'>
                Changes the random noise pattern
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noiseIntensity'>
                Coastline Variation ({(config.noiseIntensity * 100).toFixed(0)}
                %)
              </Label>
              <Slider
                id='noiseIntensity'
                min={0}
                max={1}
                step={0.05}
                value={[config.noiseIntensity || 0.3]}
                onValueChange={(value) =>
                  handleConfigChange('noiseIntensity', value[0])
                }
              />
              <p className='text-xs text-muted-foreground'>
                Controls how jagged and varied coastlines appear
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='noiseScale'>
                Noise Scale ({config.noiseScale?.toFixed(1) || '4.0'})
              </Label>
              <Slider
                id='noiseScale'
                min={1}
                max={8}
                step={0.5}
                value={[config.noiseScale || 4]}
                onValueChange={(value) =>
                  handleConfigChange('noiseScale', value[0])
                }
              />
              <p className='text-xs text-muted-foreground'>
                Adjusts the scale of coastline features
              </p>
            </div>

            <div className='space-y-2'>
              <Label htmlFor='islandCount'>
                Peninsula Count ({config.islandCount || 3})
              </Label>
              <Slider
                id='islandCount'
                min={0}
                max={8}
                step={1}
                value={[config.islandCount || 3]}
                onValueChange={(value) =>
                  handleConfigChange('islandCount', value[0])
                }
              />
              <p className='text-xs text-muted-foreground'>
                Number of peninsulas or sub-islands to generate
              </p>
            </div>
          </>
        )}

        <div className='space-y-2'>
          <Label htmlFor='relaxationIterations'>
            Relaxation ({config.relaxationIterations})
          </Label>
          <Slider
            id='relaxationIterations'
            min={0}
            max={3}
            step={1}
            value={[config.relaxationIterations]}
            onValueChange={(value) =>
              handleConfigChange('relaxationIterations', value[0])
            }
          />
          <p className='text-xs text-muted-foreground'>
            More iterations create more evenly spaced regions
          </p>
        </div>

        <div className='space-y-2'>
          <Label htmlFor='riverCount'>Rivers ({config.riverCount})</Label>
          <Slider
            id='riverCount'
            min={0}
            max={100}
            step={5}
            value={[config.riverCount]}
            onValueChange={(value) =>
              handleConfigChange('riverCount', value[0])
            }
          />
        </div>

        <div className='space-y-2'>
          <Label htmlFor='lakeProbability'>
            Lake Frequency ({(config.lakeProbability * 100).toFixed(0)}%)
          </Label>
          <Slider
            id='lakeProbability'
            min={0}
            max={0.5}
            step={0.05}
            value={[config.lakeProbability]}
            onValueChange={(value) =>
              handleConfigChange('lakeProbability', value[0])
            }
          />
        </div>
      </div>

      <Separator />

      <div className='flex flex-col gap-2'>
        <Button onClick={onGenerate} disabled={isGenerating} className='w-full'>
          {isGenerating ? (
            <>
              <Loader2 className='mr-2 h-4 w-4 animate-spin' />
              Generating...
            </>
          ) : (
            <>
              <RefreshCw className='mr-2 h-4 w-4' />
              Generate Map
            </>
          )}
        </Button>

        <Button
          variant='outline'
          onClick={onDownload}
          disabled={isGenerating}
          className='w-full'
        >
          <Download className='mr-2 h-4 w-4' />
          Download Map
        </Button>
      </div>

      <Separator />
    </div>
  );
};

export default MapControls;

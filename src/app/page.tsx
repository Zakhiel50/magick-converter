'use client';

import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  ImageIcon, 
  Loader2, 
  Download, 
  Upload, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  FileStack,
  Clock,
  Sparkles,
  Monitor,
  Tablet,
  Smartphone
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

type ConversionStatus = 'original' | 'processing' | 'completed' | 'error';

interface ConversionTask {
  id: string;
  file: File;
  preview: string;
  status: ConversionStatus;
  resultBlob?: Blob;
  resultUrl?: string;
  resultSize?: number;
  error?: string;
  format: string;
}

const FORMATS = [
  { id: 'jpg', label: 'JPEG', description: 'Photo standard', color: 'bg-orange-500' },
  { id: 'png', label: 'PNG', description: 'Haute qualité', color: 'bg-blue-500' },
  { id: 'webp', label: 'WebP', description: 'Optimisé web', color: 'bg-emerald-500', badge: 'Rapide' },
  { id: 'avif', label: 'AVIF', description: 'Nouvelle génération', color: 'bg-indigo-500', badge: 'Léger' },
  { id: 'gif', label: 'GIF', description: 'Animation', color: 'bg-purple-500' },
];

const PRESETS = [
  { id: 'mobile-paysage', label: 'Mobile paysage', width: '667', height: '375', icon: Smartphone },
  { id: 'mobile-portrait', label: 'Mobile portrait', width: '375', height: '667', icon: Smartphone },
  { id: 'tablet-paysage', label: 'Tablette paysage', width: '1024', height: '768', icon: Tablet },
  { id: 'tablet-portrait', label: 'Tablette portrait', width: '768', height: '1024', icon: Tablet },
  { id: 'desktop-paysage', label: 'Desktop paysage', width: '1440', height: '900', icon: Monitor },
  { id: 'desktop-portrait', label: 'Desktop portrait', width: '900', height: '1440', icon: Monitor },
];

export default function Home() {
  const [tasks, setTasks] = useState<ConversionTask[]>([]);
  const [width, setWidth] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [targetFormat, setTargetFormat] = useState<string>('jpg');
  const [quality, setQuality] = useState<number>(80);
  const [isProcessingAll, setIsProcessingAll] = useState(false);
  
  // Toggles for features
  const [enableResize, setEnableResize] = useState(true);
  const [enableQuality, setEnableQuality] = useState(true);
  const [enableFormat, setEnableFormat] = useState(true);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      const newTasks: ConversionTask[] = newFiles.map(file => ({
        id: Math.random().toString(36).substr(2, 9),
        file,
        preview: URL.createObjectURL(file),
        status: 'original',
        format: targetFormat
      }));
      setTasks(prev => [...prev, ...newTasks]);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeTask = (id: string) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (task?.preview) URL.revokeObjectURL(task.preview);
      if (task?.resultUrl) URL.revokeObjectURL(task.resultUrl);
      return prev.filter(t => t.id !== id);
    });
  };

  const processTask = async (task: ConversionTask) => {
    setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'processing', error: undefined } : t));

    const formData = new FormData();
    formData.append('file', task.file);
    
    if (enableResize) {
      formData.append('width', width);
      formData.append('height', height);
    }
    
    if (enableFormat) {
      formData.append('format', targetFormat);
    } else {
      // If format is disabled, use original extension
      const ext = task.file.name.split('.').pop()?.toLowerCase() || 'jpg';
      formData.append('format', ext);
    }
    
    if (enableQuality) {
      formData.append('quality', quality.toString());
    }
    
    formData.append('originalName', task.file.name);

    try {
      const response = await fetch('/api/convert', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Échec de la conversion');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      setTasks(prev => prev.map(t => t.id === task.id ? { 
        ...t, 
        status: 'completed', 
        resultBlob: blob, 
        resultUrl: url,
        resultSize: blob.size,
        format: enableFormat ? targetFormat : (task.file.name.split('.').pop()?.toLowerCase() || 'jpg')
      } : t));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Échec de la conversion';
      setTasks(prev => prev.map(t => t.id === task.id ? { ...t, status: 'error', error: message } : t));
    }
  };

  const handleProcessAll = async () => {
    setIsProcessingAll(true);
    const pendingTasks = tasks.filter(t => t.status === 'original' || t.status === 'error');
    
    await Promise.all(pendingTasks.map(task => processTask(task)));
    setIsProcessingAll(false);
  };

  const downloadTask = (task: ConversionTask) => {
    if (!task.resultUrl) return;
    const a = document.createElement('a');
    a.href = task.resultUrl;
    const baseName = task.file.name.substring(0, task.file.name.lastIndexOf('.')) || task.file.name;
    a.download = `${baseName}.${task.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadAllFiles = async () => {
    const completedTasks = tasks.filter(t => t.status === 'completed' && t.resultUrl);
    if (completedTasks.length === 0) return;

    for (let i = 0; i < completedTasks.length; i++) {
      downloadTask(completedTasks[i]);
      if (i < completedTasks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  };

  const clearCompleted = () => {
    setTasks(prev => {
      prev.forEach(t => {
        if (t.status === 'completed') {
          URL.revokeObjectURL(t.preview);
          if (t.resultUrl) URL.revokeObjectURL(t.resultUrl);
        }
      });
      return prev.filter(t => t.status !== 'completed');
    });
  };

  const clearAllTasks = () => {
    tasks.forEach(t => {
      URL.revokeObjectURL(t.preview);
      if (t.resultUrl) URL.revokeObjectURL(t.resultUrl);
    });
    setTasks([]);
  };

  const estimateWeight = (originalSize: number) => {
    const qualityFactor = enableQuality ? quality / 100 : 0.9;
    let formatFactor = 0.8; 
    
    const format = enableFormat ? targetFormat : 'original';

    switch (format) {
      case 'webp': formatFactor = 0.65; break;
      case 'avif': formatFactor = 0.45; break;
      case 'png': formatFactor = 1.1; break;
      case 'gif': formatFactor = 1.3; break;
      default: formatFactor = 0.85;
    }

    const estimated = originalSize * formatFactor * (0.2 + 0.8 * qualityFactor);
    return (estimated / 1024).toFixed(1);
  };

  const getStatusBadge = (status: ConversionStatus) => {
    switch (status) {
      case 'original': return <Badge variant="outline" className="text-slate-400 border-slate-200"><Clock className="w-3 h-3 mr-1" /> Prêt</Badge>;
      case 'processing': return <Badge variant="outline" className="text-blue-500 border-blue-200 bg-blue-50"><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Conversion</Badge>;
      case 'completed': return <Badge variant="outline" className="text-emerald-500 border-emerald-200 bg-emerald-50"><CheckCircle2 className="w-3 h-3 mr-1" /> Terminé</Badge>;
      case 'error': return <Badge variant="outline" className="text-red-500 border-red-200 bg-red-50"><AlertCircle className="w-3 h-3 mr-1" /> Échec</Badge>;
    }
  };

  const applyPreset = (p: typeof PRESETS[0]) => {
    setWidth(p.width);
    setHeight(p.height);
    setEnableResize(true);
  };

  return (
    <main className="min-h-screen bg-[#fafafa] relative overflow-hidden flex flex-col items-center justify-start p-6 pt-12">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-100/50 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-100/50 rounded-full blur-3xl animate-pulse delay-700" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-4xl z-10"
      >
        <div className="text-center mb-10">
          <motion.div 
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            className="mx-auto w-16 h-16 bg-linear-to-br from-blue-500 to-indigo-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-200"
          >
            <ImageIcon className="w-8 h-8" />
          </motion.div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 mb-2">Magic Converter</h1>
          <p className="text-slate-500 text-lg">Transformez vos images par lots en quelques secondes</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4 space-y-6">
            <Card className="border-none shadow-xl bg-white/80 backdrop-blur-xl sticky top-6">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" />
                  Réglages
                </CardTitle>
                <CardDescription>Configurez votre conversion</CardDescription>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className={cn("space-y-4 transition-opacity", !enableQuality && "opacity-50")}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Checkbox id="enable-quality" checked={enableQuality} onCheckedChange={(val) => setEnableQuality(!!val)} />
                      <Label htmlFor="enable-quality" className="text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer">Qualité</Label>
                    </div>
                    {enableQuality && (
                      <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold">
                        {quality}%
                      </Badge>
                    )}
                  </div>
                  <Slider 
                    disabled={!enableQuality}
                    value={[quality]} 
                    min={1} 
                    max={100} 
                    step={1} 
                    onValueChange={(val) => {
                      if (val && val.length > 0) {
                        setQuality(val[0]);
                      }
                    }}
                  />
                  <p className="text-[10px] text-slate-400 leading-tight">
                    Une qualité plus basse réduit considérablement le poids du fichier.
                  </p>
                </div>

                <Separator className="bg-slate-100" />

                <div className={cn("space-y-4 transition-opacity", !enableFormat && "opacity-50")}>
                  <div className="flex items-center gap-2">
                    <Checkbox id="enable-format" checked={enableFormat} onCheckedChange={(val) => setEnableFormat(!!val)} />
                    <Label htmlFor="enable-format" className="text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer">Format Cible</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {FORMATS.slice(0, 4).map((f) => (
                      <button
                        disabled={!enableFormat}
                        key={f.id}
                        onClick={() => setTargetFormat(f.id)}
                        className={cn(
                          "flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all",
                          !enableFormat ? "cursor-not-allowed" : "cursor-pointer",
                          enableFormat && targetFormat === f.id 
                            ? 'border-indigo-500 bg-indigo-50/50 shadow-sm' 
                            : 'border-slate-100 bg-white hover:border-slate-200'
                        )}
                      >
                        <span className={cn(
                          "text-xs font-bold",
                          enableFormat && targetFormat === f.id ? 'text-indigo-600' : 'text-slate-600'
                        )}>{f.label}</span>
                        {f.badge && <span className="text-[8px] text-indigo-400 font-bold uppercase">{f.badge}</span>}
                      </button>
                    ))}
                  </div>
                </div>

                <Separator className="bg-slate-100" />

                <div className={cn("space-y-4 transition-opacity", !enableResize && "opacity-50")}>
                  <div className="flex items-center gap-2">
                    <Checkbox id="enable-resize" checked={enableResize} onCheckedChange={(val) => setEnableResize(!!val)} />
                    <Label htmlFor="enable-resize" className="text-xs font-bold uppercase tracking-wider text-slate-400 cursor-pointer">Dimensions</Label>
                  </div>
                  
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {PRESETS.map((p) => (
                      <button
                        disabled={!enableResize}
                        key={p.id}
                        onClick={() => applyPreset(p)}
                        className={cn(
                          "flex-1 flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all max-w-20",
                          !enableResize ? "cursor-not-allowed opacity-50" : "hover:bg-slate-50 cursor-pointer",
                          enableResize && width === p.width && height === p.height
                            ? "border-indigo-200 bg-indigo-50/50 text-indigo-600 shadow-sm"
                            : "border-slate-100 bg-white text-slate-500"
                        )}
                      >
                        <p.icon className="w-4 h-4" />
                        <span className="text-[10px] font-bold uppercase">{p.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Largeur                  
                      </p>
                      <Input 
                        disabled={!enableResize}
                        type="number" placeholder="Auto" className="h-10 text-sm bg-slate-50/50 border-slate-100 focus:bg-white transition-colors" 
                        value={width} onChange={(e) => setWidth(e.target.value)} 
                      />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-400 leading-tight">
                        Hauteur                  
                      </p>
                      <Input 
                        disabled={!enableResize}
                        type="number" placeholder="Auto" className="h-10 text-sm bg-slate-50/50 border-slate-100 focus:bg-white transition-colors" 
                        value={height} onChange={(e) => setHeight(e.target.value)} 
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex-col gap-2">
                <Button 
                  className="w-full h-12 bg-indigo-600 hover:bg-indigo-700 font-bold rounded-xl shadow-lg shadow-indigo-100"
                  onClick={handleProcessAll}
                  disabled={tasks.length === 0 || isProcessingAll}
                >
                  {isProcessingAll ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                  Tout convertir
                </Button>
                {tasks.some(t => t.status === 'completed') && (
                  <div className="space-y-2 w-full mt-2">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 border-slate-200 hover:bg-slate-50 font-bold rounded-xl"
                      onClick={downloadAllFiles}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Tout télécharger
                    </Button>
                  </div>
                )}
              </CardFooter>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-6">
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="group border-2 border-dashed border-slate-200 bg-white/50 hover:bg-white hover:border-indigo-400 rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center shadow-sm"
            >
              <input ref={fileInputRef} type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
              <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Upload className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-slate-700">Ajouter des images</h3>
              <p className="text-sm text-slate-400">Glissez-déposez ou cliquez pour parcourir</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <FileStack className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-bold text-slate-500 uppercase tracking-widest">
                    File d&apos;attente ({tasks.length})
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="sm" onClick={clearAllTasks} className="text-xs text-red-400 hover:text-red-600 hover:bg-red-50">
                    Vider la liste
                  </Button>
                  {tasks.some(t => t.status === 'completed') && (
                    <Button variant="ghost" size="sm" onClick={clearCompleted} className="text-xs text-slate-400 hover:text-slate-600">
                      Effacer terminés
                    </Button>
                  )}
                </div>
              </div>

              <AnimatePresence initial={false}>
                {tasks.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white/40 border border-slate-100 rounded-2xl p-12 text-center"
                  >
                    <p className="text-slate-400 italic">Aucun fichier dans la file.</p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {tasks.map((task) => (
                      <motion.div
                        key={task.id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white border border-slate-100 rounded-2xl p-3 shadow-sm flex items-center gap-4 group"
                      >
                        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                          <img src={task.preview} alt="" className="w-full h-full object-cover" />
                        </div>
                        
                        <div className="flex-grow min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-sm font-bold text-slate-700 truncate">{task.file.name}</p>
                            {getStatusBadge(task.status)}
                          </div>
                          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium">
                            <span className="line-through opacity-50">{(task.file.size / 1024).toFixed(1)} KB</span>
                            <span>•</span>
                            <span className="uppercase">{task.file.type.split('/')[1]}</span>
                            <span>•</span>
                            {task.status === 'completed' ? (
                              <span className="text-emerald-500 font-bold bg-emerald-50 px-1.5 py-0.5 rounded italic">
                                Final : {(task.resultSize! / 1024).toFixed(1)} KB
                              </span>
                            ) : (
                              <span className="text-indigo-500 font-bold bg-indigo-50 px-1.5 py-0.5 rounded italic">
                                Est. : {estimateWeight(task.file.size)} KB
                              </span>
                            )}
                            {task.status === 'completed' && (
                              <>
                                <span>•</span>
                                <span className="text-emerald-500 font-bold uppercase">Vers {task.format}</span>
                              </>
                            )}
                          </div>
                          {task.error && (
                            <p className="text-[10px] text-red-500 mt-1 font-medium truncate">{task.error}</p>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {task.status === 'completed' && (
                            <Button 
                              size="icon" variant="ghost" className="h-9 w-9 text-indigo-600 hover:bg-indigo-50"
                              onClick={() => downloadTask(task)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                          )}
                          {task.status === 'original' && (
                            <Button 
                              size="icon" variant="ghost" className="h-9 w-9 text-blue-600 hover:bg-blue-50"
                              onClick={() => processTask(task)}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            size="icon" variant="ghost" className="h-9 w-9 text-slate-300 hover:text-red-500 hover:bg-red-50"
                            onClick={() => removeTask(task.id)}
                            disabled={task.status === 'processing'}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </main>
  );
}

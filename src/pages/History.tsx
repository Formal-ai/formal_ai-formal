import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Calendar } from "lucide-react";
import EditorLayout from "@/components/EditorLayout";
import { format } from "date-fns";

interface Generation {
  id: string;
  created_at: string;
  prompt: string;
  result_text: string;
  type: string;
  image_url: string | null;
}

const History = () => {
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchGenerations();
  }, []);

  const fetchGenerations = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setGenerations(data || []);
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (gen: Generation) => {
    if (!gen.image_url) {
      // Fallback to text download
      const element = document.createElement("a");
      const file = new Blob([gen.result_text], { type: 'text/plain' });
      element.href = URL.createObjectURL(file);
      element.download = `formal-ai-${gen.type}-${gen.id.slice(0, 8)}.txt`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
      return;
    }

    try {
      const response = await fetch(gen.image_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `formal-ai-${gen.type}-${gen.id.slice(0, 8)}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download image.");
    }
  };

  return (
    <EditorLayout>
      <div className="min-h-screen bg-background py-8 px-6">
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold font-serif">Generation History</h1>
            <Button variant="outline" onClick={fetchGenerations} className="rounded-full">Refresh</Button>
          </div>

          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-primary" />
            </div>
          ) : generations.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground bg-card/50 rounded-3xl border border-dashed border-border">
              <p>No generations found. Start creating in the Studio!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {generations.map((gen) => (
                <Card key={gen.id} className="ios-glass-card overflow-hidden hover:shadow-xl transition-all group">
                  <div className="aspect-[4/5] relative overflow-hidden bg-muted">
                    {gen.image_url ? (
                      <img
                        src={gen.image_url}
                        alt="Generation result"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground italic text-xs p-4">
                        Analysis Report Only
                      </div>
                    )}
                    <div className="absolute top-3 right-3">
                      <div className="bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-widest">
                        {gen.type}
                      </div>
                    </div>
                  </div>
                  <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                    <div className="flex items-center text-xs text-muted-foreground font-mono">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(gen.created_at), 'MMM d, yyyy')}
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4">
                    <div className="bg-primary/5 p-3 rounded-xl text-[11px] leading-relaxed text-foreground/80 line-clamp-3 italic">
                      "{gen.result_text?.slice(0, 150)}..."
                    </div>
                    <Button
                      onClick={() => handleDownload(gen)}
                      className="w-full text-xs rounded-xl shadow-lg shadow-primary/10"
                      variant="secondary"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download HD Asset
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </EditorLayout>
  );
};

export default History;

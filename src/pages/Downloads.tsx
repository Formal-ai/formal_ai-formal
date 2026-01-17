import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Image as ImageIcon, ExternalLink } from "lucide-react";
import EditorLayout from "@/components/EditorLayout";
import { toast } from "sonner";

interface Generation {
  id: string;
  image_url: string | null;
  type: string;
  created_at: string;
}

const Downloads = () => {
  const [savedItems, setSavedItems] = useState<Generation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSavedItems();
  }, []);

  const fetchSavedItems = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const { data, error } = await supabase
        .from('generations')
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_saved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSavedItems(data || []);
    } catch (error) {
      console.error("Error fetching downloads:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (url: string, id: string) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.setAttribute('download', `formal-ai-download-${id.slice(0, 8)}.jpg`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
    } catch (error) {
      toast.error("Download failed. Please try again.");
    }
  };

  return (
    <EditorLayout>
      <div className="p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
        <div>
          <h1 className="text-3xl font-bold font-serif">Your Downloads</h1>
          <p className="text-muted-foreground mt-2">Access your high-definition professional assets</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        ) : savedItems.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 bg-card/40 rounded-[32px] border border-dashed border-border space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-muted-foreground opacity-50" />
            </div>
            <div className="text-center">
              <h3 className="font-bold">No saved files yet</h3>
              <p className="text-sm text-muted-foreground">Generated images you save will appear here for high-speed access.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedItems.map((item) => (
              <Card key={item.id} className="ios-glass-card overflow-hidden group">
                <CardContent className="p-0">
                  <div className="aspect-square relative overflow-hidden bg-muted">
                    {item.image_url ? (
                      <img
                        src={item.image_url}
                        alt="Saved generation"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">No Preview</div>
                    )}
                    <div className="absolute top-4 right-4 h-8 px-3 rounded-full bg-black/50 backdrop-blur-md text-white text-[10px] font-bold flex items-center uppercase tracking-widest">
                      {item.type}
                    </div>
                  </div>
                  <div className="p-4 flex gap-3">
                    <Button
                      className="flex-1 rounded-xl h-11"
                      onClick={() => item.image_url && handleDownload(item.image_url, item.id)}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Download HD
                    </Button>
                    <Button variant="outline" className="w-11 h-11 p-0 rounded-xl" onClick={() => window.open(item.image_url!, '_blank')}>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </EditorLayout>
  );
};

export default Downloads;

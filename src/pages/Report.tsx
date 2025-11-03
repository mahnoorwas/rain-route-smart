import { useState, useEffect } from "react";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { Camera, MapPin } from "lucide-react";
import { z } from "zod";

const reportSchema = z.object({
  location: z.string().min(1, "Location is required").max(100),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  rain_level: z.enum(["low", "moderate", "high"]),
});

export default function Report() {
  const [user, setUser] = useState<any>(null);
  const [location, setLocation] = useState("");
  const [latitude, setLatitude] = useState<number>(24.8607); // Default Karachi
  const [longitude, setLongitude] = useState<number>(67.0099);
  const [description, setDescription] = useState("");
  const [rainLevel, setRainLevel] = useState<"low" | "moderate" | "high">("moderate");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
          toast.success("Location detected!");
        },
        (error) => {
          toast.error("Unable to get your location");
        }
      );
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const validated = reportSchema.parse({
        location,
        description,
        latitude,
        longitude,
        rain_level: rainLevel,
      });

      setLoading(true);

      const { error } = await supabase.from("road_reports").insert({
        user_id: user.id,
        location: validated.location,
        latitude: validated.latitude,
        longitude: validated.longitude,
        description: validated.description,
        rain_level: validated.rain_level,
        image_url: imageUrl || null,
      });

      if (error) throw error;

      // Add eco stats
      await supabase.from("eco_stats").insert({
        user_id: user.id,
        co2_saved: 1.5,
        action_type: "road_report",
      });

      // Update profile total
      const { data: profile } = await supabase
        .from("profiles")
        .select("total_co2_saved")
        .eq("id", user.id)
        .single();

      if (profile) {
        await supabase
          .from("profiles")
          .update({ total_co2_saved: (profile.total_co2_saved || 0) + 1.5 })
          .eq("id", user.id);
      }

      toast.success("Report submitted successfully! You saved 1.5 kg CO₂ 🌱");
      navigate("/map");
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast.error(error.errors[0].message);
      } else {
        toast.error("Failed to submit report");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen sky-gradient">
      <Navbar user={user} />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="max-w-2xl mx-auto">
          <Card className="glass-card border-2 border-white/20">
            <CardHeader>
              <CardTitle className="text-3xl">Report Road Condition</CardTitle>
              <CardDescription>
                Help your community by reporting flooded or damaged roads. Earn eco points for every report!
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="location">Location *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="location"
                      placeholder="e.g., Clifton Block 5"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                      className="bg-white/50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={getCurrentLocation}
                      className="gap-2"
                    >
                      <MapPin className="w-4 h-4" />
                      Detect
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="latitude">Latitude</Label>
                    <Input
                      id="latitude"
                      type="number"
                      step="any"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value))}
                      className="bg-white/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="longitude">Longitude</Label>
                    <Input
                      id="longitude"
                      type="number"
                      step="any"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value))}
                      className="bg-white/50"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rain-level">Rain/Flood Level *</Label>
                  <Select value={rainLevel} onValueChange={(value: any) => setRainLevel(value)}>
                    <SelectTrigger className="bg-white/50">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low - Minor puddles</SelectItem>
                      <SelectItem value="moderate">Moderate - Ankle deep water</SelectItem>
                      <SelectItem value="high">High - Severe flooding</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe the road condition, traffic situation, and any hazards..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                    className="bg-white/50 min-h-32"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image-url">Image URL (optional)</Label>
                  <div className="flex gap-2">
                    <Input
                      id="image-url"
                      type="url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      className="bg-white/50"
                    />
                    <Button type="button" variant="outline" className="gap-2">
                      <Camera className="w-4 h-4" />
                      Upload
                    </Button>
                  </div>
                </div>

                <Button type="submit" variant="hero" className="w-full" disabled={loading}>
                  {loading ? "Submitting..." : "Submit Report"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useRef } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Cloud, Droplets, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

export default function LiveMap() {
  const [user, setUser] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [weatherData, setWeatherData] = useState<any>(null);
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const [mapboxToken, setMapboxToken] = useState("");

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    fetchReports();
    fetchWeatherData();
  }, []);

  const fetchReports = async () => {
    const { data, error } = await supabase
      .from("road_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Failed to load reports");
    } else {
      setReports(data || []);
    }
  };

  const fetchWeatherData = async () => {
    // Mock weather data for now - user can add OpenWeatherMap API key later
    setWeatherData({
      city: "Karachi",
      rainfall: 12,
      humidity: 78,
      temperature: 28,
      condition: "Rainy",
    });
  };

  const getRiskLevel = (rainfall: number) => {
    if (rainfall > 30) return { level: "High", color: "bg-destructive", text: "Severe Flood Risk" };
    if (rainfall > 15) return { level: "Moderate", color: "bg-warning", text: "Moderate Risk" };
    return { level: "Low", color: "bg-accent", text: "Low Risk" };
  };

  const risk = weatherData ? getRiskLevel(weatherData.rainfall) : null;

  const initializeMap = () => {
    if (!mapboxToken || !mapContainer.current || map.current) return;

    mapboxgl.accessToken = mapboxToken;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [67.0099, 24.8607], // Karachi coordinates
      zoom: 11,
      pitch: 45,
    });

    map.current.addControl(new mapboxgl.NavigationControl(), "top-right");

    // Add markers for reports
    reports.forEach((report) => {
      const el = document.createElement("div");
      el.className = "marker";
      el.style.width = "30px";
      el.style.height = "30px";
      el.style.borderRadius = "50%";
      el.style.cursor = "pointer";
      
      const rainLevelColor = 
        report.rain_level === "high" ? "#FF6B6B" :
        report.rain_level === "moderate" ? "#FFA500" : "#4ECDC4";
      
      el.style.backgroundColor = rainLevelColor;
      el.style.border = "2px solid white";

      new mapboxgl.Marker(el)
        .setLngLat([report.longitude, report.latitude])
        .setPopup(
          new mapboxgl.Popup({ offset: 25 })
            .setHTML(`
              <div class="p-2">
                <h3 class="font-bold">${report.location}</h3>
                <p class="text-sm">${report.description}</p>
                <p class="text-xs text-gray-500 mt-1">Rain Level: ${report.rain_level}</p>
              </div>
            `)
        )
        .addTo(map.current!);
    });
  };

  useEffect(() => {
    if (mapboxToken) {
      initializeMap();
    }
  }, [mapboxToken, reports]);

  return (
    <div className="min-h-screen sky-gradient">
      <Navbar user={user} />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Live Flood Risk Map</h1>
          <p className="text-muted-foreground">Real-time monitoring of flood-prone areas in Karachi</p>
        </div>

        {/* Weather Alert Card */}
        {weatherData && risk && (
          <Card className={`mb-6 ${risk.color} text-white border-none`}>
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-6 h-6" />
                <div>
                  <div className="font-bold text-lg">{risk.text}</div>
                  <div className="text-sm opacity-90">
                    Current rainfall: {weatherData.rainfall}mm | Temperature: {weatherData.temperature}°C
                  </div>
                </div>
              </div>
              <Badge variant="secondary" className="bg-white/20 text-white">
                {risk.level} Risk
              </Badge>
            </CardContent>
          </Card>
        )}

        {/* Map Setup Card */}
        {!mapboxToken ? (
          <Card className="glass-card border-2 border-white/20">
            <CardContent className="p-8 text-center">
              <Cloud className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h2 className="text-2xl font-bold mb-4">Map Setup Required</h2>
              <p className="text-muted-foreground mb-6">
                To display the interactive map, please enter your Mapbox public token below.
                Get your free token at{" "}
                <a
                  href="https://mapbox.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  mapbox.com
                </a>
              </p>
              <div className="max-w-md mx-auto">
                <input
                  type="text"
                  placeholder="pk.eyJ1..."
                  value={mapboxToken}
                  onChange={(e) => setMapboxToken(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg border bg-white/50 focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card className="glass-card border-2 border-white/20 overflow-hidden">
            <div ref={mapContainer} className="w-full h-[600px] rounded-lg" />
          </Card>
        )}

        {/* Reports List */}
        <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {reports.slice(0, 6).map((report) => (
            <Card key={report.id} className="glass-card border-2 border-white/20">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-bold">{report.location}</h3>
                  <Badge
                    variant="secondary"
                    className={
                      report.rain_level === "high"
                        ? "bg-destructive/20 text-destructive"
                        : report.rain_level === "moderate"
                        ? "bg-warning/20 text-warning"
                        : "bg-accent/20 text-accent"
                    }
                  >
                    {report.rain_level}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">{report.description}</p>
                {report.image_url && (
                  <img
                    src={report.image_url}
                    alt="Report"
                    className="mt-3 rounded-lg w-full h-32 object-cover"
                  />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Leaf, FileText, TrendingUp, Calendar, Lightbulb } from "lucide-react";
import { motion } from "framer-motion";

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [reports, setReports] = useState<any[]>([]);
  const [ecoStats, setEcoStats] = useState<any[]>([]);
  const [ecoTip, setEcoTip] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else {
        fetchUserData(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (!session) {
        navigate("/auth");
      } else if (session.user) {
        fetchUserData(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchUserData = async (userId: string) => {
    // Fetch profile
    const { data: profileData } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    setProfile(profileData);

    // Fetch reports
    const { data: reportsData } = await supabase
      .from("road_reports")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setReports(reportsData || []);

    // Fetch eco stats
    const { data: ecoData } = await supabase
      .from("eco_stats")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    setEcoStats(ecoData || []);

    // Fetch random eco tip
    const { data: tipsData } = await supabase
      .from("eco_tips")
      .select("tip")
      .limit(1)
      .maybeSingle();

    if (tipsData) {
      setEcoTip(tipsData.tip);
    }
  };

  if (!user || !profile) {
    return null;
  }

  const totalCO2 = profile.total_co2_saved || 0;
  const co2Goal = 50;
  const progress = Math.min((totalCO2 / co2Goal) * 100, 100);

  return (
    <div className="min-h-screen sky-gradient">
      <Navbar user={user} />

      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="mb-6">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {profile.username}!</h1>
          <p className="text-muted-foreground">Track your impact and contributions</p>
        </div>

        {/* Stats Overview */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="glass-card border-2 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Leaf className="w-4 h-4" />
                  CO₂ Saved
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">{totalCO2.toFixed(1)} kg</div>
                <div className="mt-4">
                  <Progress value={progress} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {progress.toFixed(0)}% of {co2Goal} kg goal
                  </p>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <Card className="glass-card border-2 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  Reports Submitted
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">{reports.length}</div>
                <p className="text-xs text-muted-foreground mt-2">
                  Helping the community stay safe
                </p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="glass-card border-2 border-white/20">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Impact Level
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-warning">
                  {reports.length >= 10 ? "Hero" : reports.length >= 5 ? "Champion" : "Helper"}
                </div>
                <Badge variant="secondary" className="mt-2">
                  {reports.length >= 10 ? "🏆" : reports.length >= 5 ? "⭐" : "🌱"} Community Member
                </Badge>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Eco Tip */}
        {ecoTip && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="mb-8 bg-accent/10 border-2 border-accent/30">
              <CardContent className="p-6 flex items-start gap-4">
                <Lightbulb className="w-8 h-8 text-accent flex-shrink-0 mt-1" />
                <div>
                  <h3 className="font-bold text-lg mb-1">Eco Tip of the Day</h3>
                  <p className="text-muted-foreground">{ecoTip}</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Recent Reports */}
        <Card className="glass-card border-2 border-white/20">
          <CardHeader>
            <CardTitle>Your Recent Reports</CardTitle>
            <CardDescription>Track your contributions to the community</CardDescription>
          </CardHeader>
          <CardContent>
            {reports.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No reports yet. Submit your first report to get started!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {reports.map((report) => (
                  <div
                    key={report.id}
                    className="flex items-start gap-4 p-4 rounded-lg bg-background/50 border"
                  >
                    <Calendar className="w-5 h-5 text-muted-foreground mt-1" />
                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <h4 className="font-semibold">{report.location}</h4>
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
                      <p className="text-sm text-muted-foreground mt-1">{report.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(report.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

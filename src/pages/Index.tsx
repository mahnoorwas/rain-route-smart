import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Cloud, Droplets, MapPin, TrendingDown, Leaf, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";
import heroImage from "@/assets/hero-karachi.jpg";

const Index = () => {
  const [user, setUser] = useState<any>(null);
  const [weatherData, setWeatherData] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const features = [
    {
      icon: MapPin,
      title: "Live Flood Map",
      description: "Real-time visualization of flood-prone areas based on rainfall data",
      color: "text-primary",
    },
    {
      icon: AlertTriangle,
      title: "Smart Alerts",
      description: "AI-powered predictions warn you before flooding occurs",
      color: "text-warning",
    },
    {
      icon: Droplets,
      title: "Crowdsourced Reports",
      description: "Community-driven road condition updates with photos",
      color: "text-primary-light",
    },
    {
      icon: Leaf,
      title: "Eco Impact",
      description: "Track CO₂ saved by avoiding congested flood zones",
      color: "text-accent",
    },
  ];

  return (
    <div className="min-h-screen sky-gradient">
      <Navbar user={user} />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img src={heroImage} alt="Karachi during monsoon" className="w-full h-full object-cover" />
        </div>
        
        {/* Rain animation */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(30)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-16 bg-primary-light/20 animate-rain"
              style={{
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${1 + Math.random()}s`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent">
              Navigate Karachi Safely During Monsoons
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-foreground/80">
              Smart flood predictions, real-time alerts, and community reports to keep you safe on the road
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              {user ? (
                <>
                  <Link to="/map">
                    <Button variant="hero" size="lg" className="gap-2">
                      <MapPin className="w-5 h-5" />
                      View Live Map
                    </Button>
                  </Link>
                  <Link to="/report">
                    <Button variant="glass" size="lg" className="gap-2">
                      <AlertTriangle className="w-5 h-5" />
                      Report an Issue
                    </Button>
                  </Link>
                </>
              ) : (
                <Link to="/auth">
                  <Button variant="hero" size="lg">
                    Get Started Now
                  </Button>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-background/50">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">
              Smart Features for Safe Travel
            </h2>
            <p className="text-xl text-muted-foreground">
              AI-powered tools to navigate Karachi's monsoon challenges
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="glass-card h-full hover:scale-105 transition-transform duration-300 border-2 border-white/20">
                  <CardContent className="p-6">
                    <feature.icon className={`w-12 h-12 ${feature.color} mb-4`} />
                    <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 ocean-gradient text-white">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-5xl font-bold mb-2">1000+</div>
              <div className="text-xl opacity-90">Community Reports</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <div className="text-5xl font-bold mb-2">50+</div>
              <div className="text-xl opacity-90">Areas Monitored</div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="text-5xl font-bold mb-2">2.5k kg</div>
              <div className="text-xl opacity-90">CO₂ Saved</div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!user && (
        <section className="py-20 px-4 bg-background">
          <div className="container mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-4xl font-bold mb-6">
                Join the Movement to Fix Karachi
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                Help your community stay safe while reducing your environmental impact
              </p>
              <Link to="/auth">
                <Button variant="hero" size="lg" className="gap-2">
                  <Droplets className="w-5 h-5" />
                  Get Started Today
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="py-8 px-4 border-t bg-card">
        <div className="container mx-auto text-center text-muted-foreground">
          <p>© 2025 Fix Karachi. Making our city safer, one alert at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;

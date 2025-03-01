"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, TrendingUp, BarChart3 } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [profits, setProfits] = useState(0);
  const [sessions, setSessions] = useState(0);
  const [apy, setApy] = useState(0);
  
  // Animate stats on load
  useEffect(() => {
    const profitInterval = setInterval(() => {
      setProfits(prev => {
        if (prev < 1250000) return prev + 12500;
        clearInterval(profitInterval);
        return 1250000;
      });
    }, 30);
    
    const sessionInterval = setInterval(() => {
      setSessions(prev => {
        if (prev < 1250) return prev + 25;
        clearInterval(sessionInterval);
        return 1250;
      });
    }, 50);
    
    const apyInterval = setInterval(() => {
      setApy(prev => {
        if (prev < 18.5) return prev + 0.5;
        clearInterval(apyInterval);
        return 18.5;
      });
    }, 100);
    
    return () => {
      clearInterval(profitInterval);
      clearInterval(sessionInterval);
      clearInterval(apyInterval);
    };
  }, []);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="relative min-h-screen pt-20">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl animate-pulse-slow" style={{ animationDelay: "2s" }}></div>
      </div>
      
      {/* Hero Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="text-center"
        >
          <motion.h1 
            variants={item}
            className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6"
          >
            <span className="text-gradient-blue-purple">Automated AI Arbitrage</span>
            <br />
            <span className="text-gradient-purple-pink">& Yield on Autopilot</span> 
            <span className="ml-2">🚀</span>
          </motion.h1>
          
          <motion.p 
            variants={item}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Leverage cutting-edge AI to identify and execute profitable arbitrage opportunities across multiple exchanges while earning passive yield.
          </motion.p>
          
          <motion.div 
            variants={item}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-blue-purple hover:opacity-90 shadow-glow-blue text-white font-medium px-8 py-6 text-lg">
                Start Arbitrage
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/stake">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 font-medium px-8 py-6 text-lg">
                Earn Yield
                <TrendingUp className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </motion.div>
        </motion.div>
        
        {/* Live Stats */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto"
        >
          <Card className="glassmorphism overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center mr-3">
                  <BarChart3 className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground">Total Arbitrage Profits</h3>
              </div>
              <p className="text-3xl font-bold text-gradient-blue-purple">
                ${profits.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Across all trading pairs
              </p>
            </div>
            <div className="h-2 bg-gradient-blue-purple"></div>
          </Card>
          
          <Card className="glassmorphism overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <Zap className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground">Active AI Sessions</h3>
              </div>
              <p className="text-3xl font-bold text-gradient-purple-pink">
                {sessions.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Trading bots running now
              </p>
            </div>
            <div className="h-2 bg-gradient-purple-pink"></div>
          </Card>
          
          <Card className="glassmorphism overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-pink-500/20 flex items-center justify-center mr-3">
                  <TrendingUp className="h-5 w-5 text-pink-400" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground">Staking APY</h3>
              </div>
              <p className="text-3xl font-bold text-gradient-purple-pink">
                {apy.toFixed(1)}%
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Current yield rate
              </p>
            </div>
            <div className="h-2 bg-gradient-purple-pink"></div>
          </Card>
        </motion.div>
      </section>
      
      {/* Features Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gradient-blue-purple">
            Powered by Advanced AI Technology
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Our platform leverages cutting-edge machine learning to identify profitable trading opportunities across exchanges.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "AI-Powered Arbitrage",
              description: "Our algorithms scan multiple exchanges to find price discrepancies and execute trades automatically.",
              icon: <Zap className="h-10 w-10 text-blue-400" />,
              delay: 0.1
            },
            {
              title: "High-Yield Staking",
              description: "Earn passive income by staking your assets with industry-leading APY rates.",
              icon: <TrendingUp className="h-10 w-10 text-purple-400" />,
              delay: 0.2
            },
            {
              title: "Real-Time Analytics",
              description: "Monitor your portfolio performance with comprehensive dashboards and insights.",
              icon: <BarChart3 className="h-10 w-10 text-pink-400" />,
              delay: 0.3
            }
          ].map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: feature.delay, duration: 0.5 }}
              viewport={{ once: true }}
              className="glassmorphism rounded-xl p-8 hover:shadow-glow-blue transition-all duration-300"
            >
              <div className="mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>
      
      {/* CTA Section */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="glassmorphism rounded-2xl overflow-hidden"
        >
          <div className="p-8 md:p-12 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gradient-blue-purple">
              Ready to Start Your Arbitrage Journey?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join thousands of traders who are already leveraging our AI-powered platform to maximize their profits.
            </p>
            <Link href="/dashboard">
              <Button size="lg" className="bg-gradient-blue-purple hover:opacity-90 shadow-glow-blue text-white font-medium px-8 py-6 text-lg">
                Launch Dashboard
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
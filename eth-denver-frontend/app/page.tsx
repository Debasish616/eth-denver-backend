"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Zap, TrendingUp, BarChart3, Bitcoin, Users } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [totalStaked, setTotalStaked] = useState(0);
  const [activeStakers, setActiveStakers] = useState(0);
  const [apy, setApy] = useState(0);
  
  // Animate stats on load
  useEffect(() => {
    const stakedInterval = setInterval(() => {
      setTotalStaked(prev => {
        if (prev < 1250000) return prev + 12500;
        clearInterval(stakedInterval);
        return 1250000;
      });
    }, 30);
    
    const stakersInterval = setInterval(() => {
      setActiveStakers(prev => {
        if (prev < 1250) return prev + 25;
        clearInterval(stakersInterval);
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
      clearInterval(stakedInterval);
      clearInterval(stakersInterval);
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
            <span className="text-gradient-blue-purple">Bringing the most profitable</span>
            <br />
            <span className="text-gradient-purple-pink">trade in DeFi to Bitcoin</span> 
            <span className="ml-2">₿</span>
          </motion.h1>
          
          <motion.p 
            variants={item}
            className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            Maximize your Bitcoin returns with our advanced DeFi strategies and secure staking solutions.
          </motion.p>
          
          <motion.div 
            variants={item}
            className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          >
            <Link href="/stake">
              <Button size="lg" className="bg-gradient-blue-purple hover:opacity-90 shadow-glow-blue text-white font-medium px-8 py-6 text-lg">
                Start Staking
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/yield">
              <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 font-medium px-8 py-6 text-lg">
                View Yields
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
                  <Bitcoin className="h-5 w-5 text-blue-400" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground">Total BTC Staked</h3>
              </div>
              <p className="text-3xl font-bold text-gradient-blue-purple">
                {(totalStaked / 40000).toFixed(2)} BTC
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Across all strategies
              </p>
            </div>
            <div className="h-2 bg-gradient-blue-purple"></div>
          </Card>
          
          <Card className="glassmorphism overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center mr-3">
                  <Users className="h-5 w-5 text-purple-400" />
                </div>
                <h3 className="text-lg font-medium text-muted-foreground">Active Users</h3>
              </div>
              <p className="text-3xl font-bold text-gradient-purple-pink">
                {activeStakers.toLocaleString()}
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Growing community
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
                <h3 className="text-lg font-medium text-muted-foreground">BTC APY</h3>
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
            Bitcoin-First DeFi Platform
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Unlock the full potential of your Bitcoin with our advanced DeFi strategies and secure staking solutions.
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: "Bitcoin Staking",
              description: "Earn passive income on your Bitcoin through our secure staking pools.",
              icon: <Bitcoin className="h-10 w-10 text-blue-400" />,
              delay: 0.1
            },
            {
              title: "High BTC Yields",
              description: "Access premium yields with flexible lock periods tailored to your needs.",
              icon: <TrendingUp className="h-10 w-10 text-purple-400" />,
              delay: 0.2
            },
            {
              title: "Real-Time Analytics",
              description: "Track your Bitcoin earnings and performance with detailed insights.",
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
              Ready to Maximize Your Bitcoin?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Join thousands of users who are already earning premium yields on their Bitcoin holdings.
            </p>
            <Link href="/stake">
              <Button size="lg" className="bg-gradient-blue-purple hover:opacity-90 shadow-glow-blue text-white font-medium px-8 py-6 text-lg">
                Start Earning Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
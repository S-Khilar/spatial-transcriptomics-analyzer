import { motion } from "framer-motion";
import Plot from "react-plotly.js";
import React, { useState } from "react";
import TiltCard from "./TiltCard";
import { Routes, Route, Link } from "react-router-dom";
import GuidePage from "./GuidePage";
import {
  FaLinkedin,
  FaGithub,
  FaEnvelope
} from "react-icons/fa";
import "./App.css";


function App() {

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleUpload = async () => {

    setError(null);

    if (!file) {
      setError("Please upload a ZIP dataset");
      return;
    }

    if (!file.name.toLowerCase().endsWith(".zip")) {
      setError("Only ZIP files are allowed");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    setResult(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 300000);

    try {
      const response = await fetch(
        "https://spatial-transcriptomics-analyzer-0enw.onrender.com/run-analysis",
        {
          method: "POST",
          body: formData,
          signal: controller.signal,
        }
      );

      clearTimeout(timeout);

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Server error");
      }

      setResult(data);

    } catch (err) {

      console.error(err);

      if (err.name === "AbortError") {
        setError("Analysis timeout");
      } else if (err instanceof TypeError) {
        setError("Backend connection failed");
      } else {
        setError(err.message);
      }

    } finally {
      clearTimeout(timeout);
      setLoading(false);
    }
  };

  return (
    <Routes>
      <Route 
        path="/" 
        element={ 
          <div className="app">

            {/* Background Effects */}
            <div className="floating-orb orb1"></div>
            <div className="floating-orb orb2"></div>
            <div className="bg-glow glow1"></div>
            <div className="bg-glow glow2"></div>

            {/* Top Navigation */}
            <header className="top-nav">

              <div className="brand">

                <div className="logo-dot"></div>

                <div>
                  <h1>Spatial GNN Analyzer</h1>
                  <p>AI Spatial Transcriptomics Platform</p>
                </div>

              </div>

              <nav className="nav-links">
                <Link to="/guide">Guide</Link>
                <a href="#upload">Upload</a>
                <a href="#dashboard">Dashboard</a>
                <a href="#visuals">Visuals</a>
                <a href="#downloads">Downloads</a>

              </nav>

              <div className="status-chip">
                AI Engine Online
              </div>

            </header>

            {/* Hero Section */}
            <motion.section

              className="hero-section"
              id="upload"

              initial={{
                opacity: 0,
                y: 40
              }}

              animate={{
                opacity: 1,
                y: 0
              }}
            
              transition={{
                duration: 0.8,
                ease: "easeOut"
              }}
            >
              <div className="hero-content">

                <div className="hero-badge">
                  Spatial Biology Intelligence
                </div>

                <h2>
                  Advanced Graph Neural Network Analysis
                  for Spatial Transcriptomics
                </h2>

                <p>
                  AI-powered spatial domain discovery, graph learning,
                  marker gene analysis, attention mapping, and
                  spatially variable gene detection.
                </p>

                {/* Upload Panel */}
                <div className="upload-panel">

                  <div className="upload-area">

                    <input
                      type="file"
                      accept=".zip"
                      onChange={(e) => setFile(e.target.files[0] || null)}
                    />

                    <span>
                      Upload Visium Dataset (.zip)
                    </span>

                    {file && (
                      <div className="selected-file">
                        {file.name}
                      </div>
                    )}

                  </div>

                  <button
                    className="run-btn"
                    onClick={handleUpload}
                    disabled={loading}
                  >
                    {loading
                      ? "Running Spatial AI Pipeline..."
                      : "Run Analysis"}
                  </button>

                </div>

                {/* Loading */}
                {loading && (
                  <div className="loading-box">

                    <div className="loader"></div>

                    Processing spatial graph intelligence...

                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="error-box">
                    {error}
                  </div>
                )}
              </div>
            </motion.section>
          

            {/* Result */}
            {result && (
              <>
                <section
                  className="dashboard-section"
                  id="dashboard"
                >

                  {/* Metrics */}
                  <motion.div

                    className="workspace-container"

                    initial={{
                      opacity: 0,
                      y: 50
                    }}

                    whileInView={{
                      opacity: 1,
                      y: 0
                    }}

                    transition={{
                      duration: 0.7
                    }}

                    viewport={{
                      once: true
                    }}

                  >
                    <div className="section-header">
                      Analysis Overview
                    </div>

                    <div className="metrics-grid">
                      <div className="metric-card">
                        <span>Total Cells</span>
                        <h3>{result.n_cells}</h3>
                      </div>

                      <div className="metric-card">
                        <span>Total Genes</span>
                        <h3>{result.n_genes}</h3>
                      </div>

                      <div className="metric-card">
                        <span>Pipeline Status</span>
                        <h3>Complete</h3>
                      </div>
                    </div>
                  </motion.div>
                </section>

              
                {/* INTERACTIVE WORKSPACE */}
                <motion.div
                  className="workspace-container"
                  initial={{
                    opacity: 0,
                    y: 50
                  }}
                  
                  whileInView={{
                    opacity: 1,
                    y: 0
                  }}

                  transition={{
                    duration: 0.7
                  }}

                  viewport={{
                    once: true
                  }}

                >
                  <section className="interactive-section">
                    
                    <div className="section-header">
                      Interactive Exploration Workspace
                    </div>
                    <div className="visuals-grid">      
                        {/* Interactive UMAP */}
                          <div className="interactive-card">

                            <h3>Interactive UMAP</h3>

                            <div className="plotly-wrapper">

                              <Plot

                                data={[
                                  {
                                    x: result.interactive.umap.x,
                                    y: result.interactive.umap.y,

                                    mode: "markers",

                                    type: "scattergl",

                                    marker: {
                                      color: result.interactive.umap.colors,
                                      size: 6,
                                    },

                                    text: result.interactive.umap.cluster,

                                    hovertemplate:
                                      "Cluster: %{text}<br>" +
                                      "UMAP1: %{x}<br>" +
                                      "UMAP2: %{y}<extra></extra>",
                                  },
                                ]}

                                layout={{
                                  autosize: true,

                                  paper_bgcolor: "rgba(0,0,0,0)",
                                  plot_bgcolor: "rgba(0,0,0,0)",

                                  font: {
                                    color: "white",
                                  },

                                  margin: {
                                    l: 0,
                                    r: 0,
                                    t: 0,
                                    b: 0,
                                  },

                                  xaxis: {
                                    title: "UMAP1",
                                    gridcolor: "rgba(255,255,255,0.08)",
                                  },

                                  yaxis: {
                                    title: "UMAP2",
                                    gridcolor: "rgba(255,255,255,0.08)",
                                  },

                                  dragmode: "pan",
                                  hovermode: "closest",
                                }}

                                config={{
                                  responsive: true,
                                  displayModeBar: true,
                                  scrollZoom: true,
                                }}
                                
                                style={{
                                  width: "100%",
                                  height: "100%",
                                }}

                              />

                            </div>
                          </div>
                      
                  

                        {/* Interactive Spatial Map */}

                      <div className="interactive-card">

                        <h3>Interactive Spatial Map</h3>

                        <div className="plotly-wrapper">

                          <Plot

                            data={[
                              {
                                x: result.interactive.spatial.x,

                                y: result.interactive.spatial.y,

                                mode: "markers",

                                type: "scattergl",

                                marker: {
                                  color: result.interactive.spatial.colors,
                                  size: 7,
                                  opacity: 0.9,
                                },

                                text: result.interactive.spatial.cluster,

                                hovertemplate:
                                  "Cluster: %{text}<br>" +
                                  "X: %{x}<br>" +
                                  "Y: %{y}<extra></extra>",
                              },
                            ]}

                            layout={{

                              autosize: true,

                              paper_bgcolor: "rgba(0,0,0,0)",

                              plot_bgcolor: "rgba(0,0,0,0)",

                              font: {
                                color: "white",
                              },

                              margin: {
                                l: 0,
                                r: 0,
                                t: 0,
                                b: 0,
                              },

                              xaxis: {
                                title: "Spatial X",
                                gridcolor: "rgba(255,255,255,0.08)",
                              },

                              yaxis: {
                                title: "Spatial Y",
                                gridcolor: "rgba(255,255,255,0.08)",
                                autorange: "reversed",
                              },

                              dragmode: "pan",

                              hovermode: "closest",
                            }}

                            config={{
                              responsive: true,
                              displayModeBar: true,
                              scrollZoom: true,
                            }}

                            style={{
                              width: "100%",
                              height: "100%",
                            }}

                          />

                        </div>

                      </div>
                    </div>
                  </section>
                </motion.div>



                {/* Visualization Section */ }
                <motion.div
                  className="workspace-container"
                  initial={{
                    opacity: 0,
                    y: 50
                  }}

                  whileInView={{
                    opacity: 1,
                    y: 0
                  }}

                  transition={{
                    duration: 0.7
                  }}

                  viewport={{
                    once: true
                  }}

                >
                  
                  <section id="visuals">
                    <div className="section-header">
                      Scientific Visualization Workspace
                    </div>
                    <div className="visual-grid">

                      
                    {/* CARD */}
                      <TiltCard>
                        <motion.div
                          className="visual-card"
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5 }}
                          viewport={{ once: true}}
                        > 
                          <h3>Spatial Clusters</h3>

                          <div className="image-wrapper">
                            <img
                              src={result.images.spatial}
                              alt="Spatial"
                            />
                          </div>
                        </motion.div>
                      </TiltCard>

                    {/* CARD */}
                      <TiltCard>
                        <div className="visual-card">
                          <h3>Interactive UMAP</h3>
                          <div className="image-wrapper">
                            <img
                            src={result.images.umap}
                            alt="UMAP"
                            />
                          </div>
                        </div>
                      </TiltCard>


                    {/* CARD */}
                      <TiltCard>
                        <div className="visual-card">
                          <h3>Marker Genes</h3>

                          <div className="image-wrapper">
                            <img
                              src={result.images.markers}
                              alt="Markers"
                            />
                          </div>
                        </div>
                      </TiltCard>

                    {/* CARD */}
                      <TiltCard>
                        <div className="visual-card">
                          <h3>Gene Expression</h3>

                          <div className="image-wrapper">
                            <img
                              src={result.images.gene_expression}
                              alt="Gene Expression"
                            />
                          </div>
                        </div>
                      </TiltCard>

                    {/* CARD */}
                      
                      <TiltCard>
                        <div className="visual-card">
                          <h3>Spatially Variable Genes</h3>
                            <div className="image-wrapper">
                              <img
                                  src={result.images.svg}
                                  alt="SVG"
                              />
                            </div>
                          </div>
                      </TiltCard>

                          {/* CARD */}
                      <TiltCard>
                        <div className="visual-card">
                          <h3>Attention Heatmap</h3>
                            <div className="image-wrapper">
                            <img
                                  src={result.images.attention}
                                  alt="Attention"
                            />
                          </div>
                        </div>
                      </TiltCard>
                    </div>
                  </section>
                </motion.div>

                {/* Downloads */ }
                < motion.div
                className="workspace-container"
                  initial={{
                    opacity: 0,
                    y: 50
                  }}

                  whileInView={{
                    opacity: 1,
                    y: 0
                  }}

                  transition={{
                    duration: 0.7
                  }}

                  viewport={{
                    once: true
                  }}

                >
                  <section
                    className="downloads-section"
                    id="downloads"
                >

                    <div className="section-header">
                      Analysis Outputs
                    </div>

                    <div className="download-grid">

                      <a
                        href={result.downloads.clusters}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Clusters CSV
                      </a>

                      <a
                        href={result.downloads.markers}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Marker Genes CSV
                      </a>

                      <a
                        href={result.downloads.svg}
                        target="_blank"
                        rel="noreferrer"
                      >
                        SVG CSV
                      </a>

                      <button
                        onClick={() => {
                          window.open(result.report, "_blank");
                        }}
                      >
                        Download PDF Report
                      </button>

                    </div>
                  </section>
              
                </motion.div >
              </>

            )}

            {/* FOOTER */}
            
            <footer className="footer">
              <div className="footer-content">
                <div className="footer-left">

                <h2>Spatial Transcriptomics GNN Analyzer</h2>

                  <p>
                    AI-powered spatial transcriptomics analysis
                    platform using Graph Neural Networks,
                    interactive visualization, and spatial
                    biology intelligence.
                  
                    <p>
                      Developed by @Subhasankar Khilar
                    </p>
                  </p>

                </div>

                <div className="footer-links">

                  <a href="#upload">Upload</a>

                  <a href="#dashboard">Dashboard</a>

                  <a href="#visuals">Visualizations</a>

                  <a href="#downloads">Downloads</a>

                  <a 
                    href="mailto:subhasankarkhilar@gmail.com">
                    <FaEnvelope />   
                  </a>

                  <a
                    href="https://www.linkedin.com/in/subhasankar-khilar-b4888829b"
                    target="_blank"
                    rel="noreferrer"
                 >
                    <FaLinkedin />
                  </a>

                  <a
                    href="https://github.com/S-Khilar"
                    target="_blank"
                    rel="noreferrer"
                  >
                     <FaGithub />
                  </a>

                </div>

              </div>

              <div className="footer-bottom">

                <span>
                  © 2026 Spatial GNN Analyzer
                </span>

                <span>
                  Built for AI Bioinformatics Research
                </span>

              </div>

            </footer>
          
          </div>
        }
      />

      <Route path="/guide" 
       element={<GuidePage />} 
      />
    </Routes>

  );  
}
export default App;
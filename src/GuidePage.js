import "./GuidePage.css";
import { Link } from "react-router-dom";

export default function GuidePage() {

  return (

    <div className="guide-page">

      <div className="guide-container">

        <div className="guide-top">

          <h1>
            Spatial GNN Analyzer Guide
          </h1>

          <Link to="/" className="back-btn">
            ← Back to Dashboard
          </Link>

        </div>

        <div className="guide-card">

          <h2>Introduction</h2>

          <p>
            Spatial GNN Analyzer is an AI-powered
            spatial transcriptomics analysis platform
            designed for graph neural network-based
            spatial domain detection, visualization,
            and marker gene analysis.
          </p>

        </div>

        <div className="guide-card">

          <h2>Supported Input</h2>

          <p>
            The platform accepts Visium spatial
            transcriptomics datasets in ZIP format.
          </p>

        </div>

        <div className="guide-card">

          <h2>ZIP File Must Contain</h2>

          <ul>

            <li>filtered_feature_bc_matrix.h5</li>

            <li>spatial/ folder</li>

            <li>tissue_positions_list.csv</li>

            <li>scalefactors_json.json</li>

            <li>tissue_hires_image.png</li>

          </ul>
            <p>
             The file structure should be as follows: (example)
                <ul>name.zip </ul>
                <ul> | </ul>
                <ul>name </ul>
                    <ul>├── filtered_feature_bc_matrix.h5 (name must match exactly)</ul>
                    <ul>├── spatial/</ul>
            </p>
        </div>

        <div className="guide-card">

          <h2>Where To Download Datasets</h2>

          <p>
            You can download public Visium datasets
            from:
          </p>

          <ul>

            <li>10x Genomics</li>

            <li>NCBI GEO</li>

            <li>Spatial Research Repositories</li>

          </ul>

        </div>

        <div className="guide-card">

          <h2>How To Use</h2>

          <ol>

            <li>Download a Visium dataset</li>

            <li>Compress dataset into ZIP format</li>

            <li>Upload ZIP file</li>

            <li>Click Run Analysis</li>

            <li>Explore interactive visualizations</li>

            <li>Download reports and CSV outputs</li>

          </ol>

        </div>

      </div>

    </div>

  );

}
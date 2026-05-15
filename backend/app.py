from fastapi.staticfiles import StaticFiles
from fastapi import FastAPI, UploadFile
from fastapi.middleware.cors import CORSMiddleware
import matplotlib.pyplot as plt
import shutil
import zipfile
import os
import uuid

app = FastAPI()
@app.get("/")
def home():
    return {"message": "Spatial GNN Backend Running"}


app.mount("/results", StaticFiles(directory="results"), name="results")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.post("/run-analysis/")
async def run_analysis(file: UploadFile):
    extract_path = None
    zip_path = "data.zip"
    try:
        
        with open(zip_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        extract_path = f"temp_data_{uuid.uuid4()}"
        os.makedirs(extract_path, exist_ok=True)
        with zipfile.ZipFile(zip_path, "r") as zip_ref:
            zip_ref.extractall(extract_path)

        # ---------- 3. Auto-detect dataset folder ----------
        
        dataset_path = None
        for root, dirs, files in os.walk(extract_path):
            if "filtered_feature_bc_matrix.h5" in files:
                dataset_path = root
                break
        
        if dataset_path is None:
            return {
                "status": "failed",
                "error": "filtered_feature_bc_matrix.h5 not found in uploaded zip"
        }

        print("Dataset path:", dataset_path)

        if not os.path.exists(os.path.join(dataset_path, "spatial")):
            return {"error": "Data file not found in the uploaded zip. 'spatial/' directory is missing."}

        from src.pipeline import run_pipeline

        adata = run_pipeline(dataset_path)
        print("Pipeline completed successfully.")

        output_dir = os.path.join("results", "output")
        os.makedirs(output_dir, exist_ok=True)

        umap_x = adata.obsm["X_umap"][:, 0].tolist()
        umap_y = adata.obsm["X_umap"][:, 1].tolist()
        spatial_x = adata.obsm["spatial"][:, 0].tolist()
        spatial_y = adata.obsm["spatial"][:, 1].tolist()
        cluster_labels = (
            adata.obs["leiden"]
            .astype(str)
            .tolist()
        )
        
        #Color code
        cluster_color_map = dict(
            zip(
                adata.obs["leiden"].cat.categories,
                adata.uns["leiden_colors"]
            )
        )

        cluster_colors = [
            cluster_color_map[c]
            for c in adata.obs["leiden"]
        ]
        
        
        return {
            "status": "completed",
            "n_cells": adata.n_obs,
            "n_genes": adata.n_vars,
            "images": {
                "spatial": f"http://127.0.0.1:8000/{output_dir}/spatial_clusters.png",
                "umap": f"http://127.0.0.1:8000/{output_dir}/umap.png",
                "markers": f"http://127.0.0.1:8000/{output_dir}/marker_genes.png",
                "gene_expression": f"http://127.0.0.1:8000/{output_dir}/top_gene_spatial.png",
                "svg": f"http://127.0.0.1:8000/{output_dir}/spatial_variable_genes.png",
                "attention": f"http://127.0.0.1:8000/{output_dir}/attention_histogram.png",
                #"attention_spatial": f"http://127.0.0.1:8000/{output_dir}/attention_spatial.png"
            },
            
            "interactive": {
                "umap": {
                    "x": umap_x,
                    "y": umap_y,
                    "cluster": cluster_labels,
                    "colors": cluster_colors 
                },
                
                "spatial": {
                    "x": spatial_x,
                    "y": spatial_y,
                    "cluster": cluster_labels,
                    "colors": cluster_colors
                }
            },
            
            "downloads": {
                "clusters": f"http://127.0.0.1:8000/results/output/clusters.csv",
                "markers": f"http://127.0.0.1:8000/results/output/marker_genes.csv",
                "svg": f"http://127.0.0.1:8000/results/output/spatial_variable_genes.csv"
            },
            
            "report": "http://127.0.0.1:8000/results/output/Spatial_GNN_Report.pdf"
            
        }
        
        
        
        
        
        
    except Exception as e:
        print("Error during analysis:", str(e))
        return {
            "status": "failed",
            "error": str(e)
        }
    finally:
        try:
            if os.path.exists(extract_path):
                shutil.rmtree(extract_path)
        except Exception as cleanup_error:
            print("Cleanup error:", cleanup_error)
        try:
            if os.path.exists(zip_path):
                os.remove(zip_path)
        except Exception as cleanup_error:
            print("Cleanup error:", cleanup_error)
from backend.report_generator import generate_pdf_report
import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
import numpy as np
import scanpy as sc
import os


    
    

def save_plots(adata, output_dir):
    os.makedirs(output_dir, exist_ok=True)

    # Spatial clusters
    sc.pl.spatial(
        adata,
        color="leiden",
        show=False
    )
    plt.savefig(os.path.join(output_dir, "spatial_clusters.png"))
    plt.close()

    # UMAP
    sc.pl.umap(
        adata,
        color="leiden",
        show=False
    )
    plt.savefig(os.path.join(output_dir, "umap.png"))
    plt.close()
    
    
    



def run_pipeline(data_path):
    import scanpy as sc
    import squidpy as sq
    import os
    
    # check if h5 exists
    h5_path = os.path.join(data_path, "filtered_feature_bc_matrix.h5")
    
    if os.path.exists(h5_path):
        adata = sc.read_visium(path=data_path)
    else:
        adata = sc.read_visium(path=data_path)  # works for mtx too
    
    
    adata.var_names_make_unique()
    output_dir = os.path.join("results", "output")
    os.makedirs(output_dir, exist_ok=True)
    
    
    
    if adata.n_obs > 3000:
        sc.pp.subsample(
            adata,
            n_obs=3000,
            random_state=42
    )
    
    
    # preprocessing
    sc.pp.calculate_qc_metrics(adata, inplace=True)
    sc.pp.normalize_total(adata)
    sc.pp.log1p(adata)
    sc.pp.highly_variable_genes(adata, n_top_genes=1000)
    adata = adata[:, adata.var['highly_variable']]
    
    
    
    
    #-------------------------------------------------------#
    sc.tl.pca(adata, n_comps=30)
    
    # Compute neighbors
    sc.pp.neighbors(adata)
    print("Neighbors computed")
    
    # # Run Leiden clustering
    sc.tl.leiden(adata)
    print("Leiden clustering completed")
    cluster_df = adata.obs[["leiden"]]
    cluster_df.to_csv(
        os.path.join(output_dir, "clusters.csv")
    )
    if "leiden" not in adata.obs.columns:
        raise ValueError("Leiden clustering failed")
    
    sc.tl.umap(adata, min_dist=0.5)
    print("UMAP computed")
    #-------------------------------------------------------#
    
    
    
    
    # Marker gene detection
    sc.tl.rank_genes_groups(
        adata,
        groupby="leiden",
        method="wilcoxon"
    )
    
    marker_df = sc.get.rank_genes_groups_df(
        adata,
        group=None
    )
    marker_df.to_csv(
        os.path.join(output_dir, "marker_genes.csv"),
        index=False
    )
    
    
    
    
    # graph
    #########################  
    sq.gr.spatial_neighbors(adata)
    
 
    
    
    
    
    
    print(adata.obs.columns)
    
    
    # Spatially variable genes
    ###############################################
    sq.gr.spatial_autocorr(
        adata,
        mode="moran", genes=adata.var_names[:300]  #Moran’s I spatial autocorrelation
    )
    
    adata.uns["moranI"].to_csv(
        os.path.join(output_dir, "spatial_variable_genes.csv")
   )
    
    adj = adata.obsp['spatial_connectivities']
    
    save_plots(adata, output_dir)
    # (build edge_index, weights, model...)
    
    # Marker genes plot
    sc.pl.rank_genes_groups(
        adata,
        n_genes=5,
        show=False
   )
    
    plt.savefig(
        os.path.join(output_dir, "marker_genes.png"),
        bbox_inches="tight"
        )
    plt.close()
    
    # Top marker gene
    cluster_name = adata.uns["rank_genes_groups"]["names"].dtype.names[0]
    
    top_gene = adata.uns["rank_genes_groups"]["names"][cluster_name][0]
    
    
    # Spatial expression
    sc.pl.spatial(
        adata,
        color=top_gene,
        show=False
    )

    plt.savefig(
        os.path.join(output_dir, "top_gene_spatial.png"),
        bbox_inches="tight"
    )
    plt.close()
    
    # Top spatially variable genes
    top_svg = adata.uns["moranI"].sort_values(
        "I",
        ascending=False
    ).head(6).index.tolist()

    sc.pl.spatial(
        adata,
        color=top_svg,
        show=False
    )

    plt.savefig(
        os.path.join(output_dir, "spatial_variable_genes.png"),
        bbox_inches="tight"
    )
    plt.close()

    print("Marker plot saved")
    print("Gene expression plot saved")

    # Generate PDF report
    generate_pdf_report(output_dir, adata)

    return adata
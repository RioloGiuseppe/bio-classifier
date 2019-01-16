package net.riolabs;

import java.io.File;
import java.io.FileNotFoundException;
import java.io.IOException;

import org.apache.commons.io.FileUtils;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaSparkContext;

import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.mllib.clustering.KMeans;
import org.apache.spark.mllib.clustering.KMeansModel;
import org.apache.spark.mllib.linalg.Vector;
import org.apache.spark.mllib.linalg.Vectors;

public class JavaKMeansExample {
    public static void main(String[] args) {

        System.out.println("KMeans Classification using spark MLlib in Java . . .");
        Logger.getLogger("org").setLevel(Level.WARN);
        // hadoop home dir [path to bin folder containing winutils.exe]
        // System.setProperty("hadoop.home.dir", "D:\\hadoop\\");

        SparkConf conf = new SparkConf().setAppName("JavaKMeansExample").setMaster("local[2]")
                .set("spark.executor.memory", "3g").set("spark.driver.memory", "3g")
                .set("spark.local.dir", "C:/tmp/hive");

        JavaSparkContext jsc = new JavaSparkContext(conf);

        // Load and parse data
        String path = "data/kMeansTrainingData.txt";
        JavaRDD<String> data = jsc.textFile(path);
        JavaRDD<Vector> parsedData = data.map(s -> {
            String[] sarray = s.split(" ");
            double[] values = new double[sarray.length];
            for (int i = 0; i < sarray.length; i++) {
                values[i] = Double.parseDouble(sarray[i]);
            }
            return Vectors.dense(values);
        });
        parsedData.cache();

        // Cluster the data into three classes using KMeans
        int numClusters = 3;
        int numIterations = 20;
        KMeansModel clusters = KMeans.train(parsedData.rdd(), numClusters, numIterations);

        System.out.println("\n*****Training*****");
        int clusterNumber = 0;
        for (Vector center : clusters.clusterCenters()) {
            System.out.println("Cluster center for Clsuter " + (clusterNumber++) + " : " + center);
        }
        double cost = clusters.computeCost(parsedData.rdd());
        System.out.println("\nCost: " + cost);

        // Evaluate clustering by computing Within Set Sum of Squared Errors
        double WSSSE = clusters.computeCost(parsedData.rdd());
        System.out.println("Within Set Sum of Squared Errors = " + WSSSE);

        try {
            FileUtils.forceDelete(new File("Output"));
            System.out.println("\nDeleting old model completed.");
        } catch (FileNotFoundException e1) {
        } catch (IOException e) {
        }

        // Save and load model
        clusters.save(jsc.sc(), "Output");
        System.out.println("\rModel saved to Output/");
        KMeansModel sameModel = KMeansModel.load(jsc.sc(), "Output");

        // prediction for test vectors
        System.out.println("\n*****Prediction*****");
        System.out.println("[9.0, 0.6, 9.0] belongs to cluster " + sameModel.predict(Vectors.dense(9.0, 0.6, 9.0)));
        System.out.println("[0.2, 0.5, 0.4] belongs to cluster " + sameModel.predict(Vectors.dense(0.2, 0.5, 0.4)));
        System.out.println("[2.8, 1.6, 6.0] belongs to cluster " + sameModel.predict(Vectors.dense(2.8, 1.6, 6.0)));

        jsc.stop();
    }
}
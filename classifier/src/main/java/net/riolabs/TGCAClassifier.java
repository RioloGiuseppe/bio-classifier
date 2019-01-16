package net.riolabs;

import java.util.HashMap;
import java.util.Map;
import scala.Tuple2;
import org.apache.log4j.Level;
import org.apache.log4j.Logger;
import org.apache.spark.SparkConf;
import org.apache.spark.api.java.JavaPairRDD;
import org.apache.spark.api.java.JavaRDD;
import org.apache.spark.api.java.JavaSparkContext;
import org.apache.spark.mllib.linalg.Vectors;
import org.apache.spark.mllib.regression.LabeledPoint;
import org.apache.spark.mllib.tree.DecisionTree;
import org.apache.spark.mllib.tree.model.DecisionTreeModel;
import org.apache.spark.mllib.util.MLUtils;

public class TGCAClassifier {

    public static void main(String[] args) {

        Logger.getLogger("org").setLevel(Level.WARN);
        SparkConf sparkConf = new SparkConf().setAppName("JavaDecisionTreeClassificationExample")
                .setAppName("JavaKMeansExample").set("spark.executor.memory", "16g");

        JavaSparkContext jsc = new JavaSparkContext(sparkConf);

        // Load and parse the data file in standard libsvm format.
        // (class -> feature#:feature value -> feature#:feature value -> ...)
        String datapath = "../data/dataset.txt";
        JavaRDD<LabeledPoint> data = MLUtils.loadLibSVMFile(jsc.sc(), datapath).toJavaRDD();
        JavaRDD<LabeledPoint>[] splits = data.randomSplit(new double[] { 0.7, 0.3 });
        JavaRDD<LabeledPoint> trainingData = splits[0];
        JavaRDD<LabeledPoint> testData = splits[1];

        // Set parameters.
        int numClasses = 2;
        Map<Integer, Integer> categoricalFeaturesInfo = new HashMap<>();
        String impurity = "gini";
        int maxDepth = 5;
        int maxBins = 32;

        // Create prediction model (training)
        DecisionTreeModel model = DecisionTree.trainClassifier(trainingData, numClasses, categoricalFeaturesInfo,
                impurity, maxDepth, maxBins);

        // Create prediction model (testing)
        JavaPairRDD<Double, Double> predictionAndLabel = testData
                .mapToPair(p -> new Tuple2<>(model.predict(p.features()), p.label()));
        double testErr = predictionAndLabel.filter(pl -> !pl._1().equals(pl._2())).count() / (double) testData.count();

        System.out.println("Test Error: " + testErr);
        System.out.println("Learned classification tree model:\n" + model.toDebugString());

        model.save(jsc.sc(), "../data/classificationModel");
        // to realod model
        /*
         * DecisionTreeModel sameModel = DecisionTreeModel.load(jsc.sc(),
         * "../data/classificationModel");
         */
        /*
         * Use model.predict passing a Vector of feature to know the class
         */
        // model.predict(...);

    }
}

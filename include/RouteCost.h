#ifndef ROUTECOST_H
#define ROUTECOST_H

#include <limits>


class RouteCost {
private:
    double alpha; 
    double beta; 
    double gamma; 

public:

    RouteCost(double a = 1.0, double b = 2.0, double c = 1.5);

    
    void setWeights(double a, double b, double c);


    double getAlpha() const;
    double getBeta() const;
    double getGamma() const;

   
    double calculate(double distance, double risk, double congestion, bool blocked) const;

   
 
    RouteCost(double a = 1.0, double b = 2.0, double c = 1.5);

   
    void setWeights(double a, double b, double c);

  
    double calculate(double distance, double risk, double congestion, bool blocked) const;


    double calculate(double distance, double risk, double congestion) const;

    static bool isBlockedCost(double cost);
};

#endif 

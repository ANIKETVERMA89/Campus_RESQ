#ifndef ROUTECOST_H
#define ROUTECOST_H

#include <limits>

class RouteCost {
private:
    double alpha; // Distance coefficient
    double beta;  // Risk coefficient
    double gamma; // Congestion coefficient

public:
    // Default weights: normal operations vs emergency mode
    RouteCost(double a = 1.0, double b = 2.0, double c = 1.5);

    // Method to adjust weights dynamically during emergencies
    void setWeights(double a, double b, double c);

    // Function Overloading 1: Calculate raw components with blocked flag
    double calculate(double distance, double risk, double congestion, bool blocked) const;

    // Function Overloading 2: Calculate cost for a standard valid segment
    double calculate(double distance, double risk, double congestion) const;
};

#endif // ROUTECOST_H

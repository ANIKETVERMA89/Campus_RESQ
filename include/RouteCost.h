#ifndef ROUTECOST_H
#define ROUTECOST_H

#include <limits>

// Cost of one walkway segment:
//   cost = alpha * distance + beta * risk + gamma * congestion
// A blocked segment costs infinity, so Dijkstra never picks it.
class RouteCost {
private:
    double alpha; // Distance coefficient
    double beta;  // Risk coefficient
    double gamma; // Congestion coefficient

public:
    // Defaults: normal operations
    RouteCost(double a = 1.0, double b = 2.0, double c = 1.5);

    // Adjust weights dynamically (e.g. emergency mode). Negative values are ignored.
    void setWeights(double a, double b, double c);

    // Getters (Encapsulation)
    double getAlpha() const;
    double getBeta() const;
    double getGamma() const;

    // Function Overloading 1: segment that may be blocked
    double calculate(double distance, double risk, double congestion, bool blocked) const;

    // Function Overloading 2: standard valid segment
    double calculate(double distance, double risk, double congestion) const;

    // Helper: true if a cost means "unreachable"
    static bool isBlockedCost(double cost);
};

#endif // ROUTECOST_H

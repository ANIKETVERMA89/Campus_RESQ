#include "../include/RouteCost.h"

RouteCost::RouteCost(double a, double b, double c)
    : alpha(a), beta(b), gamma(c) {
    // Dijkstra needs non-negative costs, so fall back to defaults if invalid
    if (a < 0 || b < 0 || c < 0) {
        alpha = 1.0;
        beta = 2.0;
        gamma = 1.5;
    }
}

void RouteCost::setWeights(double a, double b, double c) {
    if (a < 0 || b < 0 || c < 0) return; // reject: negative weights break Dijkstra
    alpha = a;
    beta = b;
    gamma = c;
}

double RouteCost::getAlpha() const { return alpha; }
double RouteCost::getBeta() const { return beta; }
double RouteCost::getGamma() const { return gamma; }

// Overload 1: blocked segments are impassable
double RouteCost::calculate(double distance, double risk, double congestion, bool blocked) const {
    if (blocked) {
        return std::numeric_limits<double>::infinity();
    }
    return calculate(distance, risk, congestion);
}

// Overload 2: normal weighted sum
double RouteCost::calculate(double distance, double risk, double congestion) const {
    return alpha * distance + beta * risk + gamma * congestion;
}

bool RouteCost::isBlockedCost(double cost) {
    return cost == std::numeric_limits<double>::infinity();
}

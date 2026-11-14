
#include "../include/RouteCost.h"

RouteCost::RouteCost(double a, double b, double c) {
    alpha = a;
    beta = b;
    gamma = c;
}

void RouteCost::setWeights(double a, double b, double c) {
    alpha = a;
    beta = b;
    gamma = c;
}

double RouteCost::calculate(double distance, double risk, double congestion) const {
    return alpha * distance + beta * risk + gamma * congestion;
}

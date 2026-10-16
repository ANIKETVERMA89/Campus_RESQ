#include "../include/Route.h"

Route::Route()
    : source(-1), destination(-1), totalDistance(0.0), totalRisk(0.0), totalCongestion(0.0), totalCost(0.0) {}

Route::Route(int src, int dest, const std::vector<int>& p, double dist, double risk, double cong, double cost)
    : source(src), destination(dest), path(p), totalDistance(dist), totalRisk(risk), totalCongestion(cong), totalCost(cost) {}

int Route::getSource() const {
    return source;
}

int Route::getDestination() const {
    return destination;
}

const std::vector<int>& Route::getPath() const {
    return path;
}

double Route::getTotalDistance() const {
    return totalDistance;
}

double Route::getTotalRisk() const {
    return totalRisk;
}

double Route::getTotalCongestion() const {
    return totalCongestion;
}

double Route::getTotalCost() const {
    return totalCost;
}

void Route::displayRoute() const {
    std::cout << "--- Route Summary ---" << std::endl;
    std::cout << "From: " << source << " -> To: " << destination << std::endl;
    std::cout << "Path: ";
    for (size_t i = 0; i < path.size(); ++i) {
        std::cout << path[i];
        if (i + 1 < path.size()) std::cout << " -> ";
    }
    std::cout << "\nDistance: " << totalDistance 
              << " | Risk: " << totalRisk 
              << " | Congestion: " << totalCongestion 
              << " | Total Cost: " << totalCost << std::endl;
}

// Operator Overloading implementation
bool Route::operator<(const Route& other) const {
    return this->totalCost < other.totalCost;
}

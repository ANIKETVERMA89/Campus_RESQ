#ifndef ROUTE_H
#define ROUTE_H

#include <vector>
#include <iostream>

class Route {
private:
    int source;
    int destination;
    std::vector<int> path;
    double totalDistance;
    double totalRisk;
    double totalCongestion;
    double totalCost;

public:
    // Default constructor
    Route();
    // Parameterized constructor
    Route(int src, int dest, const std::vector<int>& p, double dist, double risk, double cong, double cost);
    // Getters (Encapsulation)
    int getSource() const;
    int getDestination() const;
    const std::vector<int>& getPath() const;
    double getTotalDistance() const;
    double getTotalRisk() const;
    double getTotalCongestion() const;
    double getTotalCost() const;

    // Display helper
    void displayRoute() const;

    // Operator Overloading: Compare two routes by total cost
    bool operator<(const Route& other) const;
};

#endif // ROUTE_H

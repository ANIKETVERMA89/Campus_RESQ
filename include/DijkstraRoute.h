
#ifndef DIJKSTRA_ROUTE_H
#define DIJKSTRA_ROUTE_H

#include "RouteAlgorithm.h"
#include "RouteCost.h"

class DijkstraRoute : public RouteAlgorithm {
private:
    RouteCost cost;

public:
    DijkstraRoute(double a = 1.0, double b = 2.0, double g = 1.5) {
        cost.setWeights(a, b, g);
    }

    Route findRoute(CampusGraph& graph, int source, int destination) override;
};

#endif

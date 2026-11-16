
#ifndef ROUTEALGORITHM_H
#define ROUTEALGORITHM_H

#include "CampusGraph.h"
#include "Route.h"

class RouteAlgorithm {
public:
    virtual Route findRoute(CampusGraph& graph, int source, int destination) = 0;

    virtual ~RouteAlgorithm() {}
};

#endif

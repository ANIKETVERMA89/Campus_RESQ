
#ifndef BFS_ROUTE_H
#define BFS_ROUTE_H

#include "RouteAlgorithm.h"

class BFSRoute : public RouteAlgorithm {
private:
    bool evacuationMode;

public:
    BFSRoute(bool mode = false) {
        evacuationMode = mode;
    }

    Route findRoute(CampusGraph& graph, int source, int destination) override;
};

#endif

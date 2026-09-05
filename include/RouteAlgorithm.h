#ifndef ROUTE_ALGORITHM_H
#define ROUTE_ALGORITHM_H


#include "Route.h"
#include"CampusGraph.h"

class RouteAlgorithm{
    public:
    virtual Route findRoute(Campusgraph& graph ,int source,int destination)=0;
    virtual ~RouteAlgorithm(){

    }
};
#endif  
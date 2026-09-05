#ifndef DIJKSTRA_ROUTE_H
#define DIJKSTRA_ROUTE_H

#include "RouteAlgorithm.h"

class DijkstraRoute : public RouteAlgorithm{
    private:
    int alpha;
    int beta;
    int gamma;
    public:
    DijkstraRoute(double a,double b,double g){
        alpha=a;
        beta=b;
        gamma=g;
    }
    Route findRoute(CampusGraph& graph,int source,int destination)override;
}; 
#endif
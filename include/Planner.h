
#ifndef PLANNER_H
#define PLANNER_H

#include "RouteAlgorithm.h"
#include "EmergencyManager.h"

Route findBestExit(RouteAlgorithm& algo, CampusGraph& graph, int source);

void applyEmergencyHazard(CampusGraph& graph, const Emergency& e);

struct ResponsePlan {
    int scene = -1;
    int staging = -1;
    int entry = -1;
    bool staged = false;

    Route evac;
    Route responder;
};

ResponsePlan planResponse(CampusGraph& graph, const Emergency& e);

int safetyBand(double risk);
const char* safetyBandName(int band);
int routeBand(CampusGraph& graph, const Route& r);

Route findSafestRoute(CampusGraph& graph, int src,
                      const std::vector<int>& targets,
                      double a, double b, double c, bool noLifts);

const int FIRST_AID_ROOM = 5;

struct Guide {
    int destination = -1;
    int band = -1;
    int shortestBand = -1;

    Route route;
    Route shortest;
};

Guide guidePerson(CampusGraph& graph, int you, const std::string& type, int at);

#endif

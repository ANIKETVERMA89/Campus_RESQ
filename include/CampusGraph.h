
#ifndef CAMPUSGRAPH_H
#define CAMPUSGRAPH_H

#include <iostream>
#include <vector>
#include <unordered_map>
#include "Node.h"
#include "Edge.h"

using namespace std;

class CampusGraph {
private:
    unordered_map<int, Node*> nodes;
    unordered_map<int, vector<Edge>> adjacency;
    vector<int> exitIds;

public:
    ~CampusGraph();

    void addNode(Node* node);
    Node* getNode(int id) const;

    void addEdge(Node* from, Node* to, double weight = 1.0);

    const vector<Edge>& getNeighbors(int id) const;

    vector<int> getExitIds() const;

    void spreadRisk(int origin, double intensity, double decay, int maxHops);

    void resetState();

    void displayGraph() const;

    void exportJson(ostream& os, double metresPerUnit) const;
};

#endif

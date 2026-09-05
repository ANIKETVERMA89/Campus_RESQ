#ifndef CAMPUSGRAPH_H
#define CAMPUSGRAPH_H

#include "node.h"
#include "edge.h"
#include <vector>
#include <unordered_map>

using namespace std;

class CampusGraph
{
private:
    vector<Node*> nodes;
    unordered_map<int, vector<Edge*>> adjacencyList;

public:
    void addNode(Node* node);
    void addEdge(Node* source, Node* destination, double distance);

    Node* getNode(int id) const;
    vector<Edge*> getNeighbors(int id) const;

    void displayGraph() const;
};

#endif
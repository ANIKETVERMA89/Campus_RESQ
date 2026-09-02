#include "../include/CampusGraph.h"
#include <iostream>

using namespace std;

void CampusGraph::addNode(Node* node)
{
    nodes.push_back(node);
}

void CampusGraph::addEdge(Node* source, Node* destination, double distance)
{
    Edge* edge = new Edge(source, destination, distance);

    adjacencyList[source->getId()].push_back(edge);
}

Node* CampusGraph::getNode(int id) const
{
    for (Node* node : nodes)
    {
        if (node->getId() == id)
        {
            return node;
        }
    }

    return nullptr;
}

vector<Edge*> CampusGraph::getNeighbors(int id) const
{
    if (adjacencyList.find(id) != adjacencyList.end())
    {
        return adjacencyList.at(id);
    }

    return {};
}

void CampusGraph::displayGraph() const
{
    for (const auto& pair : adjacencyList)
    {
        cout << "Node " << pair.first << " -> ";

        for (Edge* edge : pair.second)
        {
            cout << edge->getDestination()->getName()
                 << "(" << edge->getDistance() << ") ";
        }

        cout << endl;
    }
}
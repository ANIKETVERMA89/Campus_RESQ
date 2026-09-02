#ifndef EDGE_H
#define EDGE_H
#include "node.h"
class Edge
{
private:
    Node* source;
    Node* destination;
    double distance;
public:
    Edge(Node* source, Node* destination, double distance);
    Node* getSource() const;
    Node* getDestination() const;
    double getDistance() const;    
};
#endif
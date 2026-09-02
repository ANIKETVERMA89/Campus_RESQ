#include "../include/Edge.h"
using namespace std;
Edge::Edge(Node* source, Node* destination, double distance)
{
    this->source= source;
    this->destination= destination;
    this->distance= distance;
}
Node* Edge::getSource() const
{
    return source;
}
Node* Edge::getDestination() const
{
    return destination;
}
double Edge::getDistance() const
{
    return distance;
}

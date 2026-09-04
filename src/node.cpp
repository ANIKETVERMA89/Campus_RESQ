#include "../include/node.h"
using namespace std;
Node::Node(int id, string name, string type, bool active)
{
    this->id = id;
    this->name = name;
    this->type = type;
    this->active = active;
}

int Node::getId() const
{
    return id;
}

string Node::getName() const
{
    return name;
}

string Node::getType() const
{
    return type;
}

bool Node::isActive() const
{
    return active;
}

void Node::setActive(bool status)
{
    active = status;
}
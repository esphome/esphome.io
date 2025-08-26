#!/bin/bash


pip3 install -r requirements.txt -r requirements_test.txt
pip3 install --upgrade pre-commit
pre-commit install

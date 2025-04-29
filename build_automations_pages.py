#!/usr/bin/env python3

import argparse
import json

if __name__ == "__main__":
    file_name = "all_automations.json"
    arg_choices = ["actions", "conditions", "pin_providers"]

    parser = argparse.ArgumentParser()
    parser.add_argument(
        "-t",
        "--type",
        choices=arg_choices,
        help="Automation type to extract ('actions', 'conditions', 'pin_providers')",
    )
    args = parser.parse_args()

    with open(file_name) as json_file:
        raw_json = json.load(json_file)

    if args.type not in arg_choices:
        print("Unrecognized automation type")
        exit()

    automation_list = raw_json[args.type]

    component_dict = {}

    for item in automation_list:
        parts = item.split(".")
        if len(parts) == 2:
            if parts[0] not in component_dict:
                component_dict[parts[0]] = []
            component_dict[parts[0]].append(parts[1])

    out_str = ""

    for comp, autos in component_dict.items():
        out_str += f"- **{comp}:** "
        for item in autos:
            out_str += f"``{item}``, "
        out_str = out_str[:-2] + "\n"

    print(out_str)

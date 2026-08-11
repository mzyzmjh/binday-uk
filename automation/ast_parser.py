#!/usr/bin/env python3
"""
AST Parser for UKBinCollectionData Scrapers.
Parses Python scraper source files using the `ast` module to dynamically extract
required arguments (e.g., kwargs.get("uprn"), kwargs.get("postcode"), kwargs.get("web_id")).
"""

import ast
import os
import json
import argparse
from typing import Dict, List, Set, Any, Optional


class KwargsVisitor(ast.NodeVisitor):
    """
    AST Visitor to extract parameter keys accessed via kwargs.get(...)
    or dict lookups kwargs[...] within council scraper classes.
    """

    KNOWN_PARAMS = {
        "uprn",
        "postcode",
        "web_id",
        "house_number",
        "house_name",
        "street_name",
        "usrn",
        "paon",
        "saon",
        "url",
    }

    def __init__(self):
        self.extracted_params: Set[str] = set()
        self.class_names: List[str] = []
        self.docstring: Optional[str] = None

    def visit_ClassDef(self, node: ast.ClassDef):
        self.class_names.append(node.name)
        if not self.docstring:
            self.docstring = ast.get_docstring(node)
        self.generic_visit(node)

    def visit_Call(self, node: ast.Call):
        # Detect kwargs.get("param_name") or self._kwargs.get("param_name")
        if isinstance(node.func, ast.Attribute) and node.func.attr == "get":
            # Check if calling on kwargs or similar dict
            caller = node.func.value
            is_kwargs_caller = False
            if isinstance(caller, ast.Name) and "kwargs" in caller.id.lower():
                is_kwargs_caller = True
            elif isinstance(caller, ast.Attribute) and "kwargs" in caller.attr.lower():
                is_kwargs_caller = True

            if is_kwargs_caller and node.args:
                first_arg = node.args[0]
                if isinstance(first_arg, ast.Constant) and isinstance(first_arg.value, str):
                    param_name = first_arg.value.strip().lower()
                    if param_name in self.KNOWN_PARAMS or "_" in param_name:
                        self.extracted_params.add(param_name)

        # Detect dict lookups or other calls
        self.generic_visit(node)

    def visit_Subscript(self, node: ast.Subscript):
        # Detect kwargs["param_name"]
        if isinstance(node.value, ast.Name) and "kwargs" in node.value.id.lower():
            if isinstance(node.slice, ast.Constant) and isinstance(node.slice.value, str):
                param_name = node.slice.value.strip().lower()
                if param_name in self.KNOWN_PARAMS or "_" in param_name:
                    self.extracted_params.add(param_name)
        self.generic_visit(node)


def parse_scraper_source(source_code: str) -> Dict[str, Any]:
    """Parses Python source code and returns detected classes and parameters."""
    tree = ast.parse(source_code)
    visitor = KwargsVisitor()
    visitor.visit(tree)

    params = sorted(list(visitor.extracted_params))
    # Fallback to UPRN if no specific kwargs were explicitly found in simple scrapers
    if not params:
        params = ["uprn"]

    requires_proprietary = "web_id" in params and "uprn" not in params

    return {
        "classes": visitor.class_names,
        "required_params": params,
        "requires_proprietary_id": requires_proprietary,
        "docstring": visitor.docstring or "",
    }


def parse_councils_directory(councils_dir: str) -> Dict[str, Dict[str, Any]]:
    """Scans a directory of council scraper Python files and parses each one."""
    results = {}
    if not os.path.isdir(councils_dir):
        return results

    for filename in sorted(os.listdir(councils_dir)):
        if filename.endswith(".py") and not filename.startswith("__"):
            filepath = os.path.join(councils_dir, filename)
            module_name = filename[:-3]
            try:
                with open(filepath, "r", encoding="utf-8") as f:
                    source_code = f.read()
                results[module_name] = parse_scraper_source(source_code)
            except Exception as e:
                results[module_name] = {
                    "error": str(e),
                    "required_params": ["uprn"],
                    "requires_proprietary_id": False,
                }

    return results


def build_full_council_registry(
    mapping_file: str,
    parsed_ast_data: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """
    Merges baseline custodian mapping with AST parsed parameter requirements.
    """
    with open(mapping_file, "r", encoding="utf-8") as f:
        mapping = json.load(f)

    registry = {}
    for custodian_code, data in mapping.items():
        module_name = data.get("scraperModule", "")
        ast_info = parsed_ast_data.get(module_name) if parsed_ast_data else None

        required_params = (
            ast_info.get("required_params")
            if ast_info and "required_params" in ast_info
            else data.get("defaultRequiredParams", ["uprn"])
        )

        requires_prop = (
            ast_info.get("requires_proprietary_id")
            if ast_info and "requires_proprietary_id" in ast_info
            else data.get("requiresProprietaryId", False)
        )

        registry[custodian_code] = {
            "custodianCode": custodian_code,
            "councilName": data["councilName"],
            "scraperModule": module_name,
            "isSupported": data.get("isSupported", True),
            "status": "operational",
            "requiredParams": required_params,
            "requiresProprietaryId": requires_prop,
            "proprietaryIdLabel": data.get("proprietaryIdLabel", "Web Reference ID" if requires_prop else None),
            "proprietaryIdHelpUrl": data.get("proprietaryIdHelpUrl", None),
            "lastUpdatedFromAst": "2026-08-11T00:00:00Z",
            "failureRate24h": 0.0,
        }

    return registry


def main():
    parser = argparse.ArgumentParser(description="AST Scraper Parser for UKBinCollectionData")
    parser.add_argument("--councils-dir", type=str, default="", help="Path to UKBinCollectionData councils directory")
    parser.add_argument("--mapping-file", type=str, default="automation/council_mapping.json", help="Path to mapping JSON")
    parser.add_argument("--output", type=str, default="automation/councils_registry.json", help="Output JSON path")
    args = parser.parse_args()

    parsed_ast = {}
    if args.councils_dir and os.path.exists(args.councils_dir):
        parsed_ast = parse_councils_directory(args.councils_dir)

    registry = build_full_council_registry(args.mapping_file, parsed_ast)

    os.makedirs(os.path.dirname(args.output), exist_ok=True)
    with open(args.output, "w", encoding="utf-8") as f:
        json.dump(registry, f, indent=2)

    print(f"Successfully generated council registry with {len(registry)} councils -> {args.output}")


if __name__ == "__main__":
    main()

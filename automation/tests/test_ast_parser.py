import unittest
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from ast_parser import parse_scraper_source, build_full_council_registry


class TestAstParser(unittest.TestCase):

    def test_parse_uprn_and_postcode_scraper(self):
        sample_code = """
class LeedsCityCouncil:
    \"\"\"Leeds City Council Scraper\"\"\"
    def get_data(self, **kwargs):
        uprn = kwargs.get("uprn")
        postcode = kwargs.get("postcode")
        return {"uprn": uprn, "postcode": postcode}
"""
        result = parse_scraper_source(sample_code)
        self.assertIn("uprn", result["required_params"])
        self.assertIn("postcode", result["required_params"])
        self.assertFalse(result["requires_proprietary_id"])
        self.assertIn("LeedsCityCouncil", result["classes"])

    def test_parse_proprietary_web_id_scraper(self):
        sample_code = """
class ProprietaryCouncil:
    def get_data(self, **kwargs):
        web_id = kwargs.get("web_id")
        return {"bins": []}
"""
        result = parse_scraper_source(sample_code)
        self.assertIn("web_id", result["required_params"])
        self.assertTrue(result["requires_proprietary_id"])

    def test_parse_subscript_kwargs(self):
        sample_code = """
class TestSubscriptCouncil:
    def get_data(self, **kwargs):
        house_no = kwargs["house_number"]
        uprn = kwargs.get("uprn")
        return []
"""
        result = parse_scraper_source(sample_code)
        self.assertIn("house_number", result["required_params"])
        self.assertIn("uprn", result["required_params"])

    def test_build_full_council_registry(self):
        mapping_file = os.path.join(os.path.dirname(__file__), "..", "council_mapping.json")
        registry = build_full_council_registry(mapping_file)
        self.assertIn("4720", registry)  # Leeds
        self.assertEqual(registry["4720"]["councilName"], "Leeds City Council")
        self.assertTrue(registry["4720"]["isSupported"])


if __name__ == "__main__":
    unittest.main()

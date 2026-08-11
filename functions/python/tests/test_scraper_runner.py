import unittest
import sys
import os

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from scraper_runner import normalize_collection_date, normalize_scraper_output, execute_council_scrape


class TestScraperRunner(unittest.TestCase):

    def test_normalize_collection_date(self):
        self.assertEqual(normalize_collection_date("15/08/2026"), "2026-08-15")
        self.assertEqual(normalize_collection_date("2026-08-15"), "2026-08-15")
        self.assertEqual(normalize_collection_date("Friday, 15 August 2026"), "2026-08-15")
        self.assertIsNone(normalize_collection_date(""))
        self.assertIsNone(normalize_collection_date("invalid_date_xyz"))

    def test_normalize_scraper_output(self):
        raw = [
            {"type": "Refuse", "collection_date": "15/08/2026"},
            {"type": "Recycling", "date": "22/08/2026"},
            {"type": "Refuse", "collection_date": "15/08/2026"} # Duplicate
        ]
        res = normalize_scraper_output(raw)
        self.assertEqual(len(res), 2)
        self.assertEqual(res[0]["type"], "Refuse")
        self.assertEqual(res[0]["date"], "2026-08-15")
        self.assertEqual(res[1]["type"], "Recycling")
        self.assertEqual(res[1]["date"], "2026-08-22")

    def test_execute_council_scrape_mock(self):
        res = execute_council_scrape("LeedsCityCouncil", {"uprn": "100051234501"}, use_mock=True)
        self.assertTrue(res["success"])
        self.assertGreater(len(res["collections"]), 0)
        self.assertIn("type", res["collections"][0])
        self.assertIn("date", res["collections"][0])


if __name__ == "__main__":
    unittest.main()

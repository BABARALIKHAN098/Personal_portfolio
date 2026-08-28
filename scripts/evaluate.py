import argparse
import json
import time
from pathlib import Path

from app.core.tls import use_system_trust_store

use_system_trust_store()

import httpx


def main() -> int:
    parser = argparse.ArgumentParser(description="Run portfolio chatbot evaluation cases against a live API")
    parser.add_argument("--dataset", type=Path, default=Path("data/evaluation_questions.json"))
    parser.add_argument("--api", default="http://127.0.0.1:8001")
    parser.add_argument("--output", type=Path, default=Path("evaluation_results.json"))
    args = parser.parse_args()
    cases = json.loads(args.dataset.read_text(encoding="utf-8"))
    results = []
    with httpx.Client(timeout=30) as client:
        for case in cases:
            started = time.perf_counter()
            try:
                response = client.post(f"{args.api.rstrip('/')}/chat", json={"message":case["question"],"session_id":f"eval_{case['id'].replace('-', '_')}","history":[]})
                payload = response.json()
                answer = str(payload.get("answer", ""))
                passed_facts = all(fact.lower() in answer.lower() for fact in case["expected_facts"])
                passed_forbidden = not any(claim.lower() in answer.lower() for claim in case["forbidden_claims"])
                results.append({"id":case["id"],"status_code":response.status_code,"latency_ms":round((time.perf_counter()-started)*1000,1),"expected_facts_present":passed_facts,"forbidden_claims_absent":passed_forbidden,"grounded":payload.get("grounded"),"sources":payload.get("sources",[])})
            except Exception as exc:
                results.append({"id":case["id"],"error":type(exc).__name__,"latency_ms":round((time.perf_counter()-started)*1000,1)})
    successful = [item for item in results if "error" not in item]
    report = {"cases":len(cases),"responses":len(successful),"fact_check_passes":sum(item.get("expected_facts_present",False) and item.get("forbidden_claims_absent",False) for item in successful),"results":results}
    args.output.write_text(json.dumps(report, indent=2), encoding="utf-8")
    print(f"Evaluated {len(cases)} cases; wrote {args.output}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

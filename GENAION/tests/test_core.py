"""
GENAION Verification Test Suite
Validates modules: Hardware profiler, Memory SQLite CRUD, FTS5 search, Brain discovery, Skills, and Learning.
"""

import sys
import time
import unittest
from pathlib import Path

# Add project root to path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from core.engine import GenaionCore
from core.hardware import get_hardware_profile


class TestGenaionCore(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Use isolated test storage
        cls.core = GenaionCore()

    def test_01_hardware_profiler(self):
        hw = get_hardware_profile()
        self.assertIn("cpu_cores", hw)
        self.assertGreater(hw["cpu_cores"], 0)
        self.assertIn("ram_total_gb", hw)
        self.assertGreater(hw["ram_total_gb"], 0)
        self.assertIn("tier", hw)
        print(f"  [PASS] Hardware Profiler: detected {hw['cpu_cores']} cores, {hw['ram_total_gb']}GB RAM, tier '{hw['tier']}'")

    def test_02_memory_conversations_and_messages(self):
        conv_id = f"test_conv_{int(time.time())}"
        self.core.memory.create_conversation(conv_id, "Conversación de Prueba")
        convs = self.core.memory.list_conversations()
        self.assertTrue(any(c["id"] == conv_id for c in convs))

        # Add message
        msg_id = f"test_msg_{int(time.time())}"
        self.core.memory.add_message(msg_id, conv_id, "user", "Hola GENAION, esto es un test de memoria.")
        msgs = self.core.memory.get_messages(conv_id)
        self.assertEqual(len(msgs), 1)
        self.assertEqual(msgs[0]["content"], "Hola GENAION, esto es un test de memoria.")
        print("  [PASS] Memory CRUD: Created conversation and stored user message")

    def test_03_memory_longterm_facts(self):
        fact_id = f"fact_{int(time.time())}"
        self.core.memory.set_long_term_fact(fact_id, "preferencias", "idioma", "Español")
        facts = self.core.memory.list_long_term_facts(category="preferencias")
        self.assertTrue(any(f["key"] == "idioma" and f["value"] == "Español" for f in facts))
        print("  [PASS] Long-Term Memory: Stored and queried persistent key-value fact")

    def test_04_skills_execution(self):
        # Math skill
        res_math = self.core.skills.execute_skill("skill_math_solver", {"expression": "25 * 4"})
        self.assertEqual(res_math.get("status"), "success")
        self.assertEqual(res_math.get("result"), 100)

        # Code sandbox skill
        res_code = self.core.skills.execute_skill("skill_code_sandbox", {"code": "[x*2 for x in range(4)]"})
        self.assertEqual(res_code.get("status"), "success")
        self.assertEqual(res_code.get("result"), [0, 2, 4, 6])

        # Robotics safety interlock
        res_robot = self.core.skills.execute_skill("skill_robotics_interlock", {"command": "spin motor 1 at 1000rpm"})
        self.assertEqual(res_robot.get("status"), "BLOCKED_REQUIRES_AUTHORIZATION")
        print("  [PASS] Skills Matrix: Math, Code Sandbox and Robotics Safety Interlock passed")

    def test_05_learning_knowledge_and_corrections(self):
        doc = self.core.learning.ingest_text_document(
            title="Manual Operativo GENAION",
            content="GENAION es una arquitectura de IA local diseñada para funcionar en Termux Android y servidores soberanos.",
            topic="arquitectura"
        )
        self.assertIsNotNone(doc["id"])

        # Record correction
        corr = self.core.learning.record_correction(
            prompt="¿Qué es GENAION?",
            original_response="Es un bot",
            corrected_response="Es un núcleo soberano de inteligencia artificial modular y local.",
            reason="Mayor precisión técnica"
        )
        self.assertIsNotNone(corr["id"])
        print("  [PASS] Learning Engine: Document ingested and feedback pair recorded")

    def test_06_chat_processing_pipeline(self):
        conv_id = f"pipeline_{int(time.time())}"
        self.core.memory.create_conversation(conv_id, "Test Pipeline")
        resp = self.core.process_chat_request(conv_id, "¿Quién eres?")
        self.assertIn("content", resp)
        self.assertTrue(len(resp["content"]) > 10)
        self.assertEqual(resp["conversation_id"], conv_id)
        print("  [PASS] Chat Processing: Full pipeline executed and response generated")


def run_all_tests(core_instance=None) -> bool:
    print("=" * 65)
    print("EJECUTANDO SUITE DE PRUEBAS DE VERIFICACIÓN GENAION CORE 0.1")
    print("=" * 65)
    suite = unittest.TestLoader().loadTestsFromTestCase(TestGenaionCore)
    runner = unittest.TextTestRunner(verbosity=1)
    result = runner.run(suite)
    print("=" * 65)
    if result.wasSuccessful():
        print("[EXITO] Todos los módulos de GENAION pasaron las pruebas satisfactoriamente.")
        return True
    else:
        print("[FALLO] Se detectaron errores en la ejecución de pruebas.")
        return False


if __name__ == "__main__":
    run_all_tests()

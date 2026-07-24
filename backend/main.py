import sys
from llm.llm_client import ask_llm

sys.stdout.reconfigure(encoding="utf-8")


def main():
    print("Hello from backend!")
    response = ask_llm("Hello!")
    print(response)


if __name__ == "__main__":
    main()

import os
from typing import Dict, List

from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader
from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain import hub
from typing_extensions import List, TypedDict
from langgraph.graph import START, StateGraph

load_dotenv()
os.environ.get('OPENAI_API_KEY')
os.environ.get('LANGCHAIN_API_KEY')

# keys
class AIEngine:


    # setup
    def __init__(self):
        # chat model
        self.llm = ChatOpenAI(model="gpt-4o-mini")
        # print(f"chat model setup")

        # embeddings model
        self.embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
        # print(f"embeddings model setup")

        # vector store for semantic search
        # vector_store = Chroma(embedding_function=embeddings)
        self.vector_store = InMemoryVectorStore(self.embeddings)

        self.docs = None
        self.prompt = hub.pull("rlm/rag-prompt")
        self.graph = None

    def load_data(self) -> None:
        # load the source data
        loader = DirectoryLoader("testData")
        # print(f"directory loader setup")

        # Load the data from the directory source
        docs = loader.load()
        print(f"docs loaded")
        print(f"Total characters: {len(docs[0].page_content)}")

        # split up the text into smaller pieces for the model to ingest
        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=2000,
            chunk_overlap=400,
            add_start_index=True,
        )
        splits = text_splitter.split_documents(docs)
        print(f"Split into {len(splits)} sub-documents.")

        # embed the documents into vector DB
        self.vector_store.add_documents(documents=splits)

    # RAG
    # LangGraph setup
    # application state
    class State(TypedDict):
        question: str
        context: List[Document]
        answer: str

    # rag steps
    # semantic search based on question
    def retrieve(self, state: State) -> dict[str, list[Document]]:
        retrieved_docs = self.vector_store.similarity_search(state["question"])
        # retrieved_docs = vector_store.max_marginal_relevance_search(state["question"])
        return{"context": retrieved_docs}

    # get response with additional DB context
    def generate(self, state: State) -> dict[str, str | list[str | dict]]:
        docs_content = "\n\n".join(doc.page_content for doc in state["context"])
        message = self.prompt.invoke({"question": state["question"], "context": docs_content})
        response = self.llm.invoke(message)
        return{"answer": response.content}

    def compile_model(self) -> None:
        # using langgraph to control application flow
        # execute the steps in the order as listed
        # ----> First retrieve information, then use llm to generate a response
        graph_builder = StateGraph(self.State).add_sequence([self.retrieve, self.generate])
        graph_builder.add_edge(START, "retrieve")
        self.graph = graph_builder.compile()

    def invoke_model(self, question) -> str:
        response = self.graph.invoke({"question": question})
        return response["answer"]


def main():
    # testing
    question = ("curate a list from 1 to 5 of 5 cold weather items from my inventory to post on my instagram in a vintage pitt winter clothing drop announcement. "
                "Also tell me how to schedule the daily posts i.e. time of day, what days of the week, and post order for maximum post engagement")
    ai_engine = AIEngine()
    ai_engine.load_data()
    ai_engine.compile_model()
    response = ai_engine.invoke_model(question)

    print(f"\n__________________________________________________________\n")
    print(f'Answer: {response}')

if __name__ == "__main__":
    main()








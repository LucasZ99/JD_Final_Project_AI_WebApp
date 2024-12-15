import logging
import os

from dotenv import load_dotenv
from langchain import hub
from langchain_community.document_loaders import DirectoryLoader
from langchain_core.documents import Document
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langgraph.graph import START, StateGraph
from typing_extensions import List, TypedDict

load_dotenv()
os.environ.get('OPENAI_API_KEY')
os.environ.get('LANGCHAIN_API_KEY')

logger = logging.getLogger(__name__)

# keys
class AIEngine:


    # setup
    def __init__(self):
        # chat model
        try:
            self.llm = ChatOpenAI(model="gpt-4o-mini")
            if self.llm:
                logger.log(level=logging.INFO, msg="chat model setup")
            else:
                logger.log(level=logging.ERROR, msg="chat model setup failure")
        except Exception as e:
            logger.log(level=logging.ERROR, msg=f"chat model setup failed: {str(e)}")

        # embeddings model
        try:
            self.embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
            if self.embeddings:
                logger.log(level=logging.INFO, msg="embeddings model setup")
            else:
                logger.log(level=logging.ERROR, msg="embeddings model setup failure")
        except Exception as e:
            logger.log(level=logging.ERROR, msg=f"embeddings model setup failed: {str(e)}")

        # vector store for semantic search
        try:
            self.vector_store = InMemoryVectorStore(self.embeddings)
            if self.vector_store:
                logger.log(level=logging.INFO, msg="vector store model setup")
            else:
                logger.log(level=logging.ERROR, msg="vector store model setup failure")
        except Exception as e:
            logger.log(level=logging.ERROR, msg=f"vector store setup failed: {str(e)}")


        self.docs = None
        self.prompt = hub.pull("rlm/rag-prompt")
        self.graph = None
        self.question = None

    def load_data(self) -> None:
        # load the source data
        try:
            loader = DirectoryLoader("testData")
            docs = loader.load()


        # # Load the data from the directory source
        # print(f"docs loaded")
        # print(f"Total characters: {len(docs[0].page_content)}")

        # split up the text into smaller pieces for the model to ingest
            text_splitter = RecursiveCharacterTextSplitter(
                chunk_size=2000,
                chunk_overlap=400,
                add_start_index=True,
            )
            splits = text_splitter.split_documents(docs)

            # embed the documents into vector DB
            self.vector_store.add_documents(documents=splits)
        except Exception as e:
            logger.log(level=logging.ERROR, msg=f"load_data failed: {str(e)}")

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

    def invoke_model(self) -> str:
        response = self.graph.invoke({"question": self.question})
        return response["answer"]

    def invoke_model_custom_prompt(self, question) -> str:
        response = self.graph.invoke({"question": question})
        return response["answer"]

    def set_question(self, question_params):
        num_items = question_params["num_items"]
        start_date = question_params["start_date"]
        end_date = question_params["end_date"]
        additional_info = question_params["additional_info"]

        self.question =  (f"You are a vintage clothing owner that sells their items on Instagram. Create a numbered "
                          f"list of the items to sell in order by postDate. Use the following CSV Format:\n\n"
                          f"Number, Item Name, Post Date, Post Time, Item Price\n\n"
                          f"Use the following parameters to curate the list:\n\n"
                          f"Number of items (how many items should be included in the drop): {num_items}\n"
                          f"Start Date (the date of the first item drop): {start_date}\n"
                          f"End Date (The date the last item of the drop should be posted): {end_date}\n"
                          f"Additional Information (information specifying the type of drop and specific curation "
                          f"requests): {additional_info}\n"
                          f"Include the CSV headers previously mentioned. Don't delimit the response with '''")


def main():
    # testing
    # question = ("curate a list from 1 to 5 of 5 cold weather items from my inventory to post on my instagram in a vintage pitt winter clothing drop announcement. "
    #             "Also tell me how to schedule the daily posts i.e. time of day, what days of the week, and post order for maximum post engagement")
    question = "what is the most valuable item in my inventory? What makes it so valuable?"
    ai_engine = AIEngine()
    ai_engine.load_data()
    ai_engine.compile_model()
    response = ai_engine.invoke_model(question)

    print(f"\n__________________________________________________________\n")
    print(f'Answer: {response}')

if __name__ == "__main__":
    main()








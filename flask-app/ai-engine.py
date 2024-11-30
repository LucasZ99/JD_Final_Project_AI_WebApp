import os

from dotenv import load_dotenv
from langchain_community.document_loaders import DirectoryLoader
from langchain_core.vectorstores import InMemoryVectorStore
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain import hub

# keys
load_dotenv()
os.environ.get('OPENAI_API_KEY')
os.environ.get('LANGCHAIN_API_KEY')

#setup

# chat model
llm = ChatOpenAI(model="gpt-4o-mini")
# print(f"chat model setup")

# embeddings model
embeddings = OpenAIEmbeddings(model="text-embedding-3-large")
# print(f"embeddings model setup")

# vector store for semantic search
# vector_store = Chroma(embedding_function=embeddings)
vector_store = InMemoryVectorStore(embeddings)

# print(f"vector store setup")

# load the source data
loader = DirectoryLoader("testData")
# print(f"directory loader setup")

# Load the data from the directory source
docs = loader.load()
print(f"docs loaded")
print(f"Total characters: {len(docs[0].page_content)}")

# split up the text into smaller pieces for the model to ingest
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=200,
    chunk_overlap=40,
    add_start_index=True,
)
splits = text_splitter.split_documents(docs)
print(f"Split into {len(splits)} sub-documents.")

# embed the documents into vector DB
vector_store.add_documents(documents=splits)





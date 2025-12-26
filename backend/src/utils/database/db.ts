
import { SupabaseVectorStore } from "@langchain/community/vectorstores/supabase"
import { Document } from "@langchain/core/documents"
import { EmbeddingsInterface } from "@langchain/core/embeddings"
// @ts-ignore
import { supabase } from "./supabase"

// Simple implementation to avoid import issues
class SimpleMergerRetriever {
  retrievers: any[]

  constructor(fields: { retrievers: any[] }) {
    this.retrievers = fields.retrievers
  }

  async invoke(query: string) {
    const results = await Promise.all(this.retrievers.map(r => r.invoke(query)))
    // flatten
    const flat = results.flat()
    // dedupe by content
    const seen = new Set()
    return flat.filter(d => {
      const txt = d.pageContent
      if (seen.has(txt)) return false
      seen.add(txt)
      return true
    })
  }
}

export async function saveDocuments(
  collection: string,
  docs: Document[],
  embeddings: EmbeddingsInterface
) {
  const store = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: "documents",
    queryName: "match_documents",
  })

  // Add collection name to metadata for filtering
  const docsWithMeta = docs.map(d => {
    d.metadata = { ...d.metadata, collection }
    return d
  })

  await store.addDocuments(docsWithMeta)
}

export async function getRetriever(
  collection: string,
  embeddings: EmbeddingsInterface
) {
  const store = new SupabaseVectorStore(embeddings, {
    client: supabase,
    tableName: "documents",
    queryName: "match_documents",
  })

  return store.asRetriever({
    k: 4,
    filter: (rpc) => rpc.filter("metadata->>collection", "eq", collection),
  })
}

export async function getMultiRetriever(
  collections: string[],
  embeddings: EmbeddingsInterface
) {
  const retrievers = await Promise.all(
    collections.map(c => getRetriever(c, embeddings))
  )

  return new SimpleMergerRetriever({
    retrievers,
  })
}

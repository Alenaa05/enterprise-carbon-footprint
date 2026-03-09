"use client"

import { useEffect, useState } from "react"

const API = "http://localhost:4000/dev/compliance/recommendations"

export default function AIRecommendations() {

  const [advice, setAdvice] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    async function load() {

      try {

        const res = await fetch(API)
        const data = await res.json()

        setAdvice(data.advice)

      } catch (err) {

        console.error("AI fetch error", err)
        setAdvice("Unable to load AI insights.")

      } finally {

        setLoading(false)

      }

    }

    load()

  }, [])

  return (

    <div className="border rounded-xl p-6 bg-blue-50 shadow-sm mb-8">

      <h3 className="font-semibold text-lg mb-3">
        AI Sustainability Insights
      </h3>

      {loading ? (
        <p className="text-gray-500 text-sm">
          Generating recommendations...
        </p>
      ) : (
        <p className="text-sm text-gray-700 whitespace-pre-wrap">
          {advice}
        </p>
      )}

    </div>

  )

}
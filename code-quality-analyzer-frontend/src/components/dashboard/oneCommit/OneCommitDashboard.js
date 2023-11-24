import React, { useContext } from 'react'
import { OneCommitAnalysisContext } from '../../../OneCommitAnalysisContext'
import './one-commit-dashboard.css'
import 'chart.js/auto'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import ArchitectureSmell from '../../oneCommit/smells/ArchitectureSmell'
import DesignSmell from '../../oneCommit/smells/DesignSmell'
import TestSmell from '../../oneCommit/smells/TestSmell'
import TestabilitySmell from '../../oneCommit/smells/TestabilitySmell'
import ImplementationSmell from '../../oneCommit/smells/ImplementationSmell'
import ArchitechtureEntity from '../../oneCommit/entities/ArchitechtureEntity'
import DesignEntity from '../../oneCommit/entities/DesignEntity'
import TestEntity from '../../oneCommit/entities/TestEntity'
import TestabilityEntity from '../../oneCommit/entities/TestabilityEntity'
import ImplementationEntity from '../../oneCommit/entities/ImplementationEntity'
import api from '../../../utils/api'
import { useEffect, useState } from 'react'
import Loader from '../../loader/Loader'
import Select from 'react-select'
import axios from 'axios'
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function OneCommitDashboard() {
  const { analysisData, setAnalysisData } = useContext(OneCommitAnalysisContext)
  const [isLoading, setIsLoading] = useState(false)
  const [repoLink, setRepoLink] = useState(localStorage.getItem('repoLink'))
  const [selectedBranch, setSelectedBranch] = useState(null)
  const [branch, setBranch] = useState()
  const [commits, setCommits] = useState()
  const { fetchBranches, fetchCommits } = api()
  const [selectedCommit, setSelectedCommit] = useState(null)
  const Sbranch = JSON.parse(localStorage.getItem('branch') || '{}')
  const Scommit = localStorage.getItem('commitId')
  const AllCommits = JSON.parse(localStorage.getItem('allCommits') || '[]')
  const [localData, setLocalData] = useState([])

  useEffect(() => {
    if (!analysisData) {
      const localfetchedData = JSON.parse(
        localStorage.getItem('trendAnalysisData')
      )
      if (localfetchedData && localfetchedData.full_repo) {
        const keys = Object.keys(localfetchedData.full_repo)
        const latestKey = keys[keys.length - 1]
        const localData = localfetchedData.full_repo[latestKey]
        if (localData) {
          setLocalData(localData)
        }

      } else {
        setIsLoading(true)
        const requestData = {
          gitRepoLink: repoLink,
          branch: Sbranch.value,
          commitId: Scommit.value,
        }
        //to make the one-commit api request
        axios
          .post(
            process.env.REACT_APP_BACKEND_URL + '/onecommit/getanalysis',
            requestData,
            {
              headers: {
                'Content-Type': 'application/json',
              },
            }
          )
          .then((response) => {
            setIsLoading(false)
            if (response.status === 200) {
              setAnalysisData(response.data)
              navigate('/dashboard/oneCommit')
            }
          })
          .catch((error) => {
            setIsLoading(false)
          })
      }
    }
    setSelectedBranch(Sbranch)
    localStorage.setItem('branch', JSON.stringify(Sbranch))
    setSelectedCommit(Scommit)
    localStorage.setItem('commitId', JSON.stringify(Scommit))
    setCommits(AllCommits)
    localStorage.setItem('allCommits', JSON.stringify(AllCommits))
    fetchB()
    fetchC()
  }, [])

  const fetchB = async () => {
    var B = await fetchBranches(repoLink)
    setBranch(B)
  }

  const fetchC = async () => {
    console.log(repoLink, selectedBranch)
    if (selectedBranch) {
      var C = await fetchCommits(repoLink, selectedBranch)
      setSelectedCommit(C[0])
      localStorage.setItem('commitId', C[0])
      console.log(C)
      setCommits(C)
      localStorage.setItem('allCommits', JSON.stringify(AllCommits))
    }
  }

  const handleExecuteQuery = () => {
    setIsLoading(true)
    const selcommitSHA = selectedCommit.value
    const requestData = {
      gitRepoLink: repoLink,
      branch: selectedBranch.value,
      commitId: selcommitSHA,
    }
    console.log(requestData)
    axios
      .post(
        process.env.REACT_APP_BACKEND_URL + '/onecommit/getanalysis',
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )
      .then((response) => {
        console.log(response.data)
        if (response.status === 200) {
          setIsLoading(false)
          setAnalysisData(response.data)
          console.log('Analysis Data after API call:', response.data)
        }
      })
  }

  return (
    <>
     {isLoading && (
        <div className="loading-overlay">
           <div className="loading-spinner"></div>
            <div className="loading-content"><p>Updating Analysis</p>
          </div>
    </div>
      )}
      <div className="oneCommit">
        <div className="oneCommit-heading">
          <h1>OneCommit Analysis</h1>
        </div>
        <div className="dropdown-dropdowns">
          <div className="branch-dropdowns">
            <h4>Branches:</h4>
            <Select
              value={selectedBranch}
              onChange={(option) => {
                setSelectedBranch(option)
                fetchC()
              }}
              options={branch}
              isSearchable={true}
              placeholder=" Branch..."
            />
          </div>
          <div className="commits-dropdowns">
            <h4>Commits:</h4>
            <Select
              value={selectedCommit}
              onChange={(option) => {
                setSelectedCommit(option)
                localStorage.setItem('commitId', option)
              }}
              options={commits}
              isSearchable={true}
              getOptionLabel={(option) => option.label}
              getOptionValue={(option) => option.value}
              placeholder="Commit..."
            />
          </div>
          
       
          <button
          className={`update_button ${isLoading ? 'loading' : ''}`}
          onClick={handleExecuteQuery}
          disabled={isLoading}>Update Analysis</button>
          </div>
        


            <div className="charts">
              <div className="architechture common-chart">
                <ArchitectureSmell architectureSmellData={analysisData} />
                <ArchitechtureEntity architectureEntityData={analysisData} />
              </div>
              <div className="design common-chart">
                <DesignSmell designSmellData={analysisData} />
                <DesignEntity designEntityData={analysisData} />
              </div>
              <div className="test common-chart">
                <TestSmell testsmSmellData={analysisData} />
                <TestEntity testEntityData={analysisData} />
              </div>
              <div className="testability common-chart">
                <TestabilitySmell testabilitySmellData={analysisData} />
                <TestabilityEntity testabilityEntityData={analysisData} />
              </div>
              <div className="implementation common-chart">
                <ImplementationSmell implementationSmellData={analysisData} />
                <ImplementationEntity implementationEntityData={analysisData} />
              </div>
            </div>
     
  
              <div className="charts">
                <div className="architechture common-chart">
                  <ArchitectureSmell architectureSmellData={localData} />
                  <ArchitechtureEntity architectureEntityData={localData} />
                </div>
                <div className="design common-chart">
                  <DesignSmell designSmellData={localData} />
                  <DesignEntity designEntityData={localData} />
                </div>
                <div className="test common-chart">
                  <TestSmell testsmSmellData={localData} />
                  <TestEntity testEntityData={localData} />
                </div>
                <div className="testability common-chart">
                  <TestabilitySmell testabilitySmellData={localData} />
                  <TestabilityEntity testabilityEntityData={localData} />
                </div>
                <div className="implementation common-chart">
                  <ImplementationSmell implementationSmellData={localData} />
                  <ImplementationEntity implementationEntityData={localData} />
                </div>
              </div>
     
          <div className="loading">
            <h1>Loading...</h1>
          </div>
   
      </div>
    </>
  )
}

export default OneCommitDashboard
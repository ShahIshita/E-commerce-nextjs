import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Missing Supabase environment variables')
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    console.log('=== Testing Supabase Connection ===')
    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing')
    console.log('Supabase Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing')
    
    // Test connection by querying a test table
    // This will work even if the table doesn't exist - we're testing the connection, not the schema
    const { data, error } = await supabase
      .from('_test_connection')
      .select('*')
      .limit(1)
    
    if (error) {
      console.log('Supabase connection test result:')
      console.log('Error code:', error.code)
      console.log('Error message:', error.message)
      
      // If it's a relation not found error, the connection is working
      // This means we successfully connected to Supabase, just the table doesn't exist
      if (
        error.code === 'PGRST116' || 
        error.message.includes('relation') || 
        error.message.includes('does not exist') ||
        error.message.includes('Could not find a relationship')
      ) {
        console.log('✅ Supabase connection is WORKING!')
        console.log('Note: Test table does not exist, but connection is successful')
        
        return NextResponse.json({
          success: true,
          message: 'Supabase connection successful',
          connectionStatus: 'connected',
          note: 'Connection verified. Test table does not exist, which is expected.',
          errorDetails: error.message
        })
      }
      
      // Other errors might indicate connection issues
      console.log('⚠️ Supabase connection test completed with error:', error.message)
      return NextResponse.json({
        success: false,
        message: 'Supabase connection test failed',
        connectionStatus: 'failed',
        error: error.message,
        code: error.code
      }, { status: 500 })
    }
    
    console.log('✅ Supabase connection successful!')
    console.log('Response data:', JSON.stringify(data, null, 2))
    
    return NextResponse.json({
      success: true,
      message: 'Supabase connection successful',
      connectionStatus: 'connected',
      data: data
    })
  } catch (error) {
    console.error('❌ Supabase connection test failed with exception:')
    console.error(error)
    
    return NextResponse.json({
      success: false,
      message: 'Failed to connect to Supabase',
      connectionStatus: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}
